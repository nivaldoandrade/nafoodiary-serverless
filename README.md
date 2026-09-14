# NaFoodiary API

API serverless para um diário alimentar inteligente com inteligência artificial. O sistema permite que os usuários registrem suas refeições através de **fotos** ou **áudios**, que são analisados automaticamente por IA para identificar os alimentos, estimar quantidades e calcular macronutrientes (proteínas, carboidratos e gorduras). O sistema também calcula metas diárias personalizadas de calorias e macros com base no perfil do usuário.

## Funcionalidades

- **Autenticação completa**: Cadastro, login, refresh token e recuperação de senha via AWS Cognito;
- **Login com Google (OAuth 2.0 + PKCE)**: Autenticação via Google Identity Provider do Cognito com callback e onboarding automático do novo usuário;
- **Perfil do usuário**: Cadastro de dados pessoais (nome, data de nascimento, gênero, altura, peso, nível de atividade e objetivo);
- **Metas nutricionais**: Cálculo automático de calorias e macronutrientes diários com base no perfil (TDEE/BMR);
- **Upload de refeições**: Upload de fotos (JPEG) ou áudios (M4A, WebM) via Presigned POST do S3;
- **Análise por IA**: Identificação automática de alimentos com quantities e macronutrientes via IA;
- **Transcrição de áudio**: Transcrição automática de áudio via IA antes da análise;
- **Processamento assíncrono**: Fila SQS para processamento de refeições com retry automático;
- **CDN para arquivos**: CloudFront para servir os arquivos de refeição;
- **Alarmes**: Notificação por email quando refeições falham (Dead Letter Queue);

## Arquitetura

![Diagrama da Arquitetura](/api/assets/diagrama-arquitetura.png)

A aplicação segue uma arquitetura **serverless event-driven** com separação clara de camadas:

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway HTTP API                      │
│                     (JWT Authorizer - Cognito)                   │
└──────────┬──────────────────────────────────┬────────────────────┘
           │                                  │
           ▼                                  ▼
   ┌───────────────┐                ┌──────────────────┐
   │  Lambda HTTP  │                │ Cognito Triggers │
   │  (Controllers)│                │  (PreSignUp,     │
   │               │                │   PreTokenGen,   │
   │  - Auth       │                │   CustomMessage) │
   │  - Profile    │                └──────────────────┘
   │  - Meal       │
   │  - Account    │
   └───────┬───────┘
           │
           ▼
   ┌───────────────┐
   │  DynamoDB     │◄──── Single Table Design
   │  (Accounts,   │      (PAY_PER_REQUEST)
   │   Profiles,   │
   │   Goals,      │
   │   Meals)      │
   └───────────────┘
           │
           ▼ (upload via Presigned POST)
   ┌───────────────┐    S3 Event    ┌──────────────┐    SQS     ┌──────────────┐
   │  S3 Bucket    │───────────────►│ MealUploaded │──────────►│ MealQueue    │
   │  (Meals)      │                │ Trigger      │           │ Consumer     │
   └───────────────┘                └──────────────┘           └──────┬───────┘
                                                                      │
                                                                      ▼
                                                              ┌──────────────┐
                                                              │  OpenAI API  │
                                                              │  (GPT-5.4-mini│
                                                              │   Vision /   │
                                                              │   Transcribe)│
                                                              └──────────────┘
```

## Fluxo de Processamento de Refeições

### 1. Upload e Criação
1. Usuário envia `POST /create-meal` com `{ contentType, fileSize }`;
2. Backend cria a refeição no DynamoDB (status: `PENDING`) e retorna um `mealId` junto com dados do Presigned POST (base64);
3. Frontend faz upload direto para o S3 usando o Presigned POST;
4. S3 recebe o arquivo e dispara evento `ObjectCreated`.

### 2. Processamento Assíncrono
5. Lambda `newMealUploadedTrigger` é acionada pelo evento S3;
6. Atualiza o status da refeição para `QUEUED` e publica mensagem na fila SQS;
7. Lambda `processMeal` consome a mensagem da fila SQS;
8. Para **imagens**: envia para o GPT-5.4-mini com prompt de análise visual;
9. Para **áudios**: transcreve via GPT-4o-mini-transcribe, depois envia o texto para o GPT-5.4-mini;
10. IA retorna dados estruturados dos alimentos (nome, quantidade, proteínas, carboidratos, gorduras);
11. Backend calcula calorias e atualiza o DynamoDB com status `SUCCESS`;
12. Em caso de falha, o SQS faz retry automático (até 2 vezes). Após esgotar, vai para a Dead Letter Queue e dispara alarme por email.

## Fluxo de Autenticação OAuth (Google)

O login com Google usa o fluxo **Authorization Code + PKCE**:

```text
Frontend                          Cognito                       API (Lambda)
   |  1. Gera code_verifier        |                              |
   |  2. Redireciona para login    |                              |
   |------------------------------▶|  /oauth2/authorize            |
   |                               |  3. Usuário autentica no      |
   |                               |     Google e é redirecionado  |
   |◀--------- 4. code ------------|                              |
   |  5. POST /auth/oauth/callback |                              |
   |----------------------------------------------------------▶|
   |                               |  6. Troca code + verifier por |
   |                               |     tokens (PKCE)            |
   |◀------------ 7. tokens + isOnboarded --------------------|
   |  8. Se isOnboarded = false                                   |
   |     POST /auth/complete-onboarding                           |
   |----------------------------------------------------------▶|
   |                               |  9. Cria Account/Profile/Goal |
   |                               |     (TransactWrite) + vincula |
   |                               |     externalId -> accountId   |
   |◀--------------------- 10. 204 ----------------------------|
   |  11. POST /auth/refresh-token (obter token com internalId)   |
   |◀------------------ 12. novos access/refresh -------------|
```

1. O frontend gera um `code_verifier` aleatório e redireciona o usuário para o Cognito (`/oauth2/authorize`) com o `code_challenge` (PKCE);
2. O usuário autentica com a conta Google e o Cognito redireciona de volta com um `code`;
3. O frontend envia `code`, `redirectUri` e `codeVerifier` para `POST /auth/oauth/callback`;
4. O backend troca o `code` pelos tokens (valida `access_token` e `refresh_token`) e verifica se já existe conta para o email — retorna `200` com `{ accessToken, refreshToken, isOnboarded }`;
5. **Usuário novo** (`isOnboarded: false`): o frontend chama `POST /auth/complete-onboarding` com o `accessToken`. O backend deriva identidade do token, cria `Account`, `Profile` e `Goal` atomicamente (`TransactWriteCommand`) e vincula `custom:internalSocialId` → `accountId` no Cognito. Responde `204`;
6. Após o onboarding, o frontend chama `POST /auth/refresh-token` — os novos tokens já contêm o claim `internalId` (injetado pelo trigger `preTokenGeneration`), usado como `accountId` nas rotas protegidas.

**Observações:**
- O `complete-onboarding` é **idempotente** (conta existente com mesmo `externalId` retorna `204`);
- Se a troca de código falhar, o backend retorna `400 INVALID_GRANT`; se o email pertencer a outra conta, `409 EMAIL_ALREADY_IN_USE`;
- A troca de código tem timeout de 5 segundos.

## Pré-requisitos

- [Node.js 20 ou superior](https://nodejs.org/en/)
- Yarn ou outro package manager
- [Serverless Framework v4](https://www.serverless.com)
- [Credenciais AWS configuradas](https://www.serverless.com/framework/docs/providers/aws/guide/credentials#aws-credentials)
- [Chave de API do OpenAI](https://platform.openai.com/api-keys)

## Configuração do Serverless

1. Instale o Serverless via NPM:

   ```bash
   npm i serverless -g
   ```

   Para mais informações: [Installation](https://www.serverless.com/framework/docs/getting-started#installation).

2. Faça login no Serverless:

   Crie uma conta no Serverless e faça login com o comando abaixo:

   ```bash
   sls login
   ```

   Para mais informações: [Signing In](https://www.serverless.com/framework/docs/getting-started#signing-in).

### Configuração das Credenciais AWS

Para mais informações: [AWS Credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials#aws-credentials)

#### **Opção 1: AWS CLI (Recomendado)**

1. Faça o download e instalação: [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions).

2. Crie um: [IAM user](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html#cli-authentication-user-create)

   **OBS:** No **Attach existing policies directly** e procure e adicione a política **AdministratorAccess**.

3. Configure AWS CLI:

   ```bash
   aws configure
   ```

   Preencha com:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `sa-east-1`
   - Default output format: `json`

   Para mais informações: [Configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html#cli-authentication-user-configure.title)

#### **Opção 2: Variáveis de Ambiente**

1. Crie um: [IAM user](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html#cli-authentication-user-create)

   **OBS:** No **Attach existing policies directly** e procure e adicione a política **AdministratorAccess**.

2. Configure as variáveis de ambiente do Serverless Framework conforme a [documentação oficial](https://www.serverless.com/framework/docs/providers/aws/guide/credentials#using-aws-access-keys).

## Passo a passo

### 1. Clone o repositório

```bash
git clone https://github.com/nivaldoandrade/nafoodiary

cd nafoodiary/api
```

### 2. Instale as dependências

```bash
yarn
# ou
npm install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env e preencha os valores
```

Preencha o `.env` com os valores necessários:

```env
COGNITO_EMAIL=noreply@seudominio
COGNITO_EMAIL_TO_REPLY=suporte@seudominio
SES_SOURCE_ARN=arn:aws:ses:sa-east-1:xxxxx:configuration-set/xxxxx

API_DOMAIN_NAME=
API_CERTIFICATE_ARN=

MEALS_CDN_DOMAIN_NAME=
MEALS_CDN_CERTIFICATE_ARN=

DLQ_ALARM_EMAIL=seu-email@exemplo.com

OPENAI_API_KEY=sk-xxxxx
```

### 4. Realize o deploy na AWS

```bash
sls deploy
```

Se tudo ocorrer bem, o output esperado será:

```plaintext
endpoints:
  POST - https://xxx.execute-api.sa-east-1.amazonaws.com/auth/sign-up
  POST - https://xxx.execute-api.sa-east-1.amazonaws.com/auth/sign-in
  POST - https://xxx.execute-api.sa-east-1.amazonaws.com/auth/refresh-token
  POST - https://xxx.execute-api.sa-east-1.amazonaws.com/auth/forgot-password
  POST - https://xxx.execute-api.sa-east-1.amazonaws.com/auth/confirmation-forgot-password
  POST - https://xxx.execute-api.sa-east-1.amazonaws.com/auth/oauth/callback
  POST - https://xxx.execute-api.sa-east-1.amazonaws.com/auth/complete-onboarding
  GET  - https://xxx.execute-api.sa-east-1.amazonaws.com/me
  PUT  - https://xxx.execute-api.sa-east-1.amazonaws.com/profiles
  POST - https://xxx.execute-api.sa-east-1.amazonaws.com/create-meal
  GET  - https://xxx.execute-api.sa-east-1.amazonaws.com/meals
  GET  - https://xxx.execute-api.sa-east-1.amazonaws.com/meals/{id}
functions:
  hello: api-dev-hello
  signUp: api-dev-signUp
  signIn: api-dev-signIn
  refreshToken: api-dev-refreshToken
  forgotPassword: api-dev-forgotPassword
  confirmationForgotPassword: api-dev-confirmationForgotPassword
  oauthCallback: api-dev-oauthCallback
  completeOnboarding: api-dev-completeOnboarding
  preSignUpTrigger: api-dev-preSignUpTrigger
  preTokenGenerationTrigger: api-dev-preTokenGenerationTrigger
  customMessageTrigger: api-dev-customMessageTrigger
  me: api-dev-me
  updateProfile: api-dev-updateProfile
  createMeal: api-dev-createMeal
  listMeals: api-dev-listMeals
  getMealById: api-dev-getMealById
  newMealUploadedTrigger: api-dev-newMealUploadedTrigger
  processMeal: api-dev-processMeal
```

O endpoint base da API será: `https://xxx.execute-api.sa-east-1.amazonaws.com`

## Endpoints

### Autenticação

| Método | Url                                  | Descrição                                | Autenticação |
| ------ | ------------------------------------ | ---------------------------------------- | ------------ |
| POST   | `/auth/sign-up`                      | Cadastra um novo usuário                 | Pública      |
| POST   | `/auth/sign-in`                      | Realiza login                            | Pública      |
| POST   | `/auth/refresh-token`                | Renova tokens de acesso                  | Pública      |
| POST   | `/auth/forgot-password`              | Solicita código de recuperação de senha  | Pública      |
| POST   | `/auth/confirmation-forgot-password` | Confirma redefinição de senha com código | Pública      |
| POST   | `/auth/oauth/callback`               | Troca o code do Google por tokens (PKCE) | Pública      |
| POST   | `/auth/complete-onboarding`          | Cria conta, perfil e metas de usuário do Google | Pública  |

### Perfil e Conta

| Método | Url         | Descrição                                        | Autenticação |
| ------ | ----------- | ------------------------------------------------ | ------------ |
| GET    | `/me`       | Retorna o perfil e metas nutricionais do usuário | JWT          |
| PUT    | `/profiles` | Atualiza o perfil do usuário                     | JWT          |

### Refeições

| Método | Url                      | Descrição                                              | Autenticação |
| ------ | ------------------------ | ------------------------------------------------------ | ------------ |
| POST   | `/create-meal`           | Cria uma refeição e retorna Presigned POST para upload | JWT          |
| GET    | `/meals?date=YYYY-MM-DD` | Lista refeições de um dia específico                   | JWT          |
| GET    | `/meals/{id}`            | Retorna uma refeição por ID com detalhes dos alimentos | JWT          |

### Exemplos de Uso

#### Sign Up -> `/auth/sign-up`

- Cadastra um novo usuário com perfil e metas nutricionais:

  ```bash
  curl -X POST https://xxx.execute-api.sa-east-1.amazonaws.com/auth/sign-up \
    -H "Content-Type: application/json" \
    -d '{
      "email": "usuario@email.com",
      "password": "senha123",
      "name": "João Silva",
      "birthDate": "1990-05-15",
      "gender": "MALE",
      "height": 175,
      "weight": 80,
      "activityLevel": "MODERATE",
      "goal": "LOSE"
    }'
  ```

- Request body:
  ```json
  {
    "email": "usuario@email.com",
    "password": "senha123",
    "name": "João Silva",
    "birthDate": "1990-05-15",
    "gender": "MALE",
    "height": 175,
    "weight": 80,
    "activityLevel": "MODERATE",
    "goal": "LOSE"
  }
  ```

- Resposta esperada:
  ```json
  {
    "accountId": "2CkS0wZr5cY3xK1mN7jQ9bT2vL",
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhdWQiOiJYLmNv..."
  }
  ```

#### Sign In -> `/auth/sign-in`

- Realiza login e retorna tokens:

  ```bash
  curl -X POST https://xxx.execute-api.sa-east-1.amazonaws.com/auth/sign-in \
    -H "Content-Type: application/json" \
    -d '{
      "email": "usuario@email.com",
      "password": "senha123"
    }'
  ```

- Resposta esperada:
  ```json
  {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhdWQiOiJYLmNv..."
  }
  ```

#### OAuth Callback -> `/auth/oauth/callback`

- Troca o `code` de autorização do Google por tokens (fluxo OAuth 2.0 Authorization Code + PKCE). O `codeVerifier` é o mesmo gerado no início do fluxo pelo frontend:

  ```bash
  curl -X POST https://xxx.execute-api.sa-east-1.amazonaws.com/auth/oauth/callback \
    -H "Content-Type: application/json" \
    -d '{
      "code": "4/0AfJohXnZ0x9y...",
      "redirectUri": "https://app.nafoodiary.com/oauth/callback",
      "codeVerifier": "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvV"
    }'
  ```

- Resposta esperada (`200`):
  ```json
  {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhdWQiOiJYLmNv...",
    "isOnboarded": false
  }
  ```

- `isOnboarded: false` indica um usuário novo (sem conta no DynamoDB). Nesse caso, o frontend deve chamar `/auth/complete-onboarding` com o `accessToken` retornado. Após o onboarding, chamar `/auth/refresh-token` para obter tokens com o claim `internalId` (usado como `accountId` nas rotas autenticadas).
- Erros: `400 INVALID_GRANT` (code inválido ou expirado, ou resposta do Cognito sem tokens) e `400 VALIDATION` (body inválido). Timeout de 5s na troca de código com o Cognito.

#### Complete Onboarding -> `/auth/complete-onboarding`

- Cria a conta, o perfil e as metas nutricionais de um usuário do Google. Identidade (nome, email, `externalId`) é derivada **do access token**, não do body:

  ```bash
  curl -X POST https://xxx.execute-api.sa-east-1.amazonaws.com/auth/complete-onboarding \
    -H "Content-Type: application/json" \
    -d '{
      "accessToken": "eyJhbGciOiJSUzI1NiIs...",
      "birthDate": "1990-05-15",
      "gender": "MALE",
      "height": 175,
      "weight": 80,
      "activityLevel": "MODERATE",
      "goal": "LOSE"
    }'
  ```

- Resposta esperada: `204 No Content`.
- **Idempotente**: se a conta já existe para o mesmo `externalId` do token, retorna `204` (retry seguro após sucesso). 
- Erros: `409 EMAIL_ALREADY_IN_USE` (email já pertence a outra conta), `400 INVALID_GRANT` (token inválido/expirado ou dados ausentes no Cognito) e `400 VALIDATION` (body inválido).
- Após o sucesso, o frontend deve chamar `/auth/refresh-token` para obter tokens contendo o claim `internalId`.

#### Get Me -> `/me`

- Retorna o perfil e metas do usuário autenticado:

  ```bash
  curl -X GET https://xxx.execute-api.sa-east-1.amazonaws.com/me \
    -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
  ```

- Resposta esperada:
  ```json
  {
    "accountId": "2CkS0wZr5cY3xK1mN7jQ9bT2vL",
    "email": "usuario@email.com",
    "profile": {
      "name": "João Silva",
      "birthDate": "1990-05-15",
      "gender": "MALE",
      "height": 175,
      "weight": 80,
      "activityLevel": "MODERATE",
      "goal": "LOSE"
    },
    "goal": {
      "calories": 2200,
      "proteins": 165,
      "carbohydrates": 220,
      "fats": 73
    }
  }
  ```

#### Create Meal -> `/create-meal`

- Cria uma refeição e retorna dados do Presigned POST para upload:

  ```bash
  curl -X POST https://xxx.execute-api.sa-east-1.amazonaws.com/create-meal \
    -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
    -H "Content-Type: application/json" \
    -d '{
      "contentType": "image/jpeg",
      "fileSize": 5242880
    }'
  ```

- Resposta esperada:
  ```json
  {
    "mealId": "2CkS0wZr5cY3xK1mN7jQ9bT2vL",
    "presignedPost": "eyJ1cmwiOiJodHRwczovL2FwaS1k..."
  }
  ```

- Upload no frontend (JavaScript):

  ```javascript
  // Decodificar o presignedPost de base64
  const presignedData = JSON.parse(atob(response.presignedPost));

  const formData = new FormData();

  // Adicionar fields do Presigned POST
  Object.entries(presignedData.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Adicionar metadata e arquivo
  formData.append('X-Amz-meta-name', file.name);
  formData.append('file', file);

  // Upload direto para o S3
  await axios.post(presignedData.url, formData);
  ```

#### List Meals -> `/meals`

- Lista refeições de um dia específico:

  ```bash
  curl -X GET "https://xxx.execute-api.sa-east-1.amazonaws.com/meals?date=2026-08-26" \
    -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
  ```

- Resposta esperada:
  ```json
  {
    "meals": [
      {
        "mealId": "2CkS0wZr5cY3xK1mN7jQ9bT2vL",
        "status": "SUCCESS",
        "inputType": "IMAGE",
        "fileUrl": "https://cdn.nafoodiary.com/meals/2CkS0wZr5cY3xK1mN7jQ9bT2vL.jpg",
        "foods": [
          {
            "name": "Arroz branco",
            "quantity": "200g",
            "proteins": 5.4,
            "carbohydrates": 53.4,
            "fats": 0.6,
            "calories": 254
          },
          {
            "name": "Feijão carioca",
            "quantity": "150g",
            "proteins": 9.8,
            "carbohydrates": 30.7,
            "fats": 0.5,
            "calories": 167
          },
          {
            "name": "Peito de frango grelhado",
            "quantity": "150g",
            "proteins": 46.5,
            "carbohydrates": 0,
            "fats": 5.4,
            "calories": 240
          }
        ],
        "createdAt": "2026-08-26T12:00:00.000Z"
      }
    ]
  }
  ```

#### Get Meal By ID -> `/meals/{id}`

- Retorna uma refeição específica com detalhes dos alimentos:

  ```bash
  curl -X GET https://xxx.execute-api.sa-east-1.amazonaws.com/meals/2CkS0wZr5cY3xK1mN7jQ9bT2vL \
    -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
  ```

## Eventos

### Triggers Cognito

| Trigger            | Função                      | Descrição                                                                |
| ------------------ | --------------------------- | ------------------------------------------------------------------------ |
| PreSignUp          | `preSignUpTrigger`          | Auto-confirma e auto-verifica novos usuários (sem confirmação por email) |
| PreTokenGeneration | `preTokenGenerationTrigger` | Injeta o claim `internalId` no access token a partir de `custom:internalSocialId` (Google) ou `custom:internalId` (sign-up) |
| CustomMessage      | `customMessageTrigger`      | Personaliza o email de recuperação de senha em português                 |

### Eventos S3

| Evento        | Função                   | Descrição                                                                                        |
| ------------- | ------------------------ | ------------------------------------------------------------------------------------------------ |
| ObjectCreated | `newMealUploadedTrigger` | Quando um arquivo é enviado ao S3, lê metados, atualiza status para QUEUED e publica na fila SQS |

### Filas SQS

| Fila       | Função        | Descrição                                                         |
| ---------- | ------------- | ----------------------------------------------------------------- |
| MealsQueue | `processMeal` | Consome mensagens e processa refeições via OpenAI                 |
| MealsDLQ   | --            | Dead Letter Queue para refeições que falharam após 2 retentativas |

## Tecnologias Utilizadas

### Backend

- Serverless Framework v4;
- AWS (Lambda, API Gateway HTTP API, DynamoDB, S3, CloudFront, SQS, SNS, Cognito, SES);
- TypeScript;
- Zod (validação de schemas);
- esbuild (bundling);
- OpenAI API (GPT-5.4-mini, GPT-4o-mini-transcribe);
- KSUID (geração de IDs únicos);
- reflect-metadata (injeção de dependência via decorators).

## Recursos Criados na AWS

### DynamoDB

- **Table**: `api-{stage}-MainTable`
  - Single-table design com entidades: Account, Profile, Goal, Meal
  - Billing: PAY_PER_REQUEST
  - Point-in-time recovery: 35 dias
  - GSI1 para consultas por email e data

### Cognito

- **UserPool**: `api-{stage}-UserPool`
  - Auth flow: USER_PASSWORD_AUTH
  - Username attribute: email
  - Senha: mínimo 8 caracteres
  - Access token: 1 dia
  - Refresh token: 7 dias (com rotação)
- **UserPoolClient**: `api-{stage}-UserPoolClient`
- **Google Identity Provider**: Login com Google (Authorization Code + PKCE), scopes `profile email openid`, mapeamento de `name` e `email`, callback para o domínio do frontend

### S3

- **Bucket**: `api-{stage}-meals-bucket`
  - Armazenamento de arquivos de refeição (imagens e áudios)
  - CORS configurado para o frontend
  - Eventos de object creation habilitados

### CloudFront

- **Distribution**: CDN para servir arquivos de refeição
  - OAC (Origin Access Control) configurado com o S3
  - Suporte a domínio personalizado

### SQS

- **MealsQueue**: Fila para processamento assíncrono de refeições
- **MealsDLQ**: Dead Letter Queue com alarme por email (SNS)

### API Gateway

- HTTP API v2 com CORS habilitado
- JWT Authorizer configurado com o Cognito UserPool para rotas protegidas
- Rotas de OAuth (`/auth/oauth/callback` e `/auth/complete-onboarding`) são públicas e validam o `accessToken` no body
- Suporte a domínio personalizado (opcional)

## Variáveis de Ambiente

### Deploy (`.env`)

| Variável                    | Descrição                                               | Obrigatório |
| --------------------------- | ------------------------------------------------------- | ----------- |
| `COGNITO_EMAIL`             | Endereço de email remetente para o Cognito              | Sim         |
| `COGNITO_EMAIL_TO_REPLY`    | Endereço de email para respostas                        | Sim         |
| `SES_SOURCE_ARN`            | ARN do configuration set do SES                         | Sim         |
| `API_DOMAIN_NAME`           | Domínio personalizado da API (ex: `api.nafoodiary.com`) | Não         |
| `API_CERTIFICATE_ARN`       | ARN do certificado ACM para o domínio da API            | Não         |
| `MEALS_CDN_DOMAIN_NAME`     | Domínio personalizado do CloudFront para arquivos       | Não         |
| `MEALS_CDN_CERTIFICATE_ARN` | ARN do certificado ACM para o CDN                       | Não         |
| `DLQ_ALARM_EMAIL`           | Email para notificações de falha no processamento       | Sim         |
| `OPENAI_API_KEY`            | Chave de API do OpenAI                                  | Sim         |

### Runtime (auto-injetadas pelo Serverless)

| Variável                | Fonte                                 |
| ----------------------- | ------------------------------------- |
| `COGNITO_CLIENT_ID`     | `!Ref UserPoolClient`                 |
| `COGNITO_USER_POOL_ID`  | `!Ref UserPool`                       |
| `COGNITO_CLIENT_SECRET` | `!GetAtt UserPoolClient.ClientSecret` |
| `MAIN_TABLE_NAME`       | `!Ref MainTable`                      |
| `MEALS_BUCKET_NAME`     | `!Ref MealsBucket`                    |
| `MEALS_CDN_DOMAIN_NAME` | CloudFront domain ou fallback do env  |
| `MEALS_QUEUE_URL`       | `!Ref MealsQueue`                     |

## Arquitetura do Código

```
src/
├── kernel/                    # Camada de framework/DI
│   ├── decorators/            # @Injectable(), @Schema()
│   └── di/                    # Registry (container de DI singleton)
│
├── shared/                    # Utilitários compartilhados
│   ├── config/                # AppConfig, validação de env (Zod)
│   └── utils/                 # generateUniqueId, ValueOf
│
├── main/                      # Entry points (handlers Lambda)
│   ├── adapters/              # Adaptadores Lambda -> Controller/EventHandler/SQSHandler
│   ├── utils/                 # Body parser, response builders
│   └── functions/             # Handlers organizados por domínio
│       ├── auth/              # signUp, signIn, refreshToken, forgotPassword, triggers
│       ├── meal/              # createMeal, listMeals, getMealById, processMeal, uploadTrigger
│       ├── account/           # me
│       └── profile/           # updateProfile
│
├── application/               # Lógica de negócio
│   ├── contracts/             # Controller, IEventHandler, ISQSHandler
│   ├── entities/              # Account, Profile, Goal, Meal
│   ├── services/              # GoalCalculator (TDEE/BMR)
│   ├── useCases/              # Use cases organizados por domínio
│   ├── controllers/           # Controllers com schemas Zod
│   ├── query/                 # Queries diretas ao DynamoDB
│   ├── events/                # MealUploadedEventHandler
│   ├── queues/                # MealQueueConsumer
│   └── errors/                # ErrorCode, ApplicationError, HttpError
│
└── infra/                     # Integrações externas
    ├── clients/               # Clients AWS SDK (DynamoDB, Cognito, S3, SQS)
    ├── databases/dynamodb/    # Repositories + Item mappers + Unit of Work
    ├── gateways/              # AuthGateway, MealFileStorageGateway, MealQueueGateway
    ├── ai/                    # OpenAI integration
    │   ├── gateways/          # MealAiGateway
    │   └── prompts/           # Prompts de análise (PT-BR)
    └── utils/                 # downloadByURL
```

### Padrões Arquiteturais

- **Clean Architecture / Hexagonal**: Separação clara entre `application` (negócio), `infra` (integrações), `main` (entry points), `kernel` (framework) e `shared` (utilitários);
- **Injeção de Dependência customizada**: Container DI singleton (`Registry`) com decorator `@Injectable()` usando `reflect-metadata` para resolução automática de construtores;
- **Schema Validation Decorator**: `@Schema(zodSchema)` nos controllers para validação automática do request body;
- **Controller Pattern**: Classe abstrata `Controller<'public' | 'private'>` distinguindo rotas autenticadas vs públicas;
- **Unit of Work**: Transações DynamoDB (`TransactWriteCommand`) para escrita atômica de múltiplas entidades;
- **Event-Driven Processing**: S3 Event -> SQS -> Lambda para processamento assíncrono de refeições;
- **Single-Table DynamoDB**: Todas as entidades em uma tabela com chaves compostas e GSIs;
- **Gateway Pattern**: Camada de abstração para serviços externos (Auth, Storage, Queue, AI);

## Comandos Úteis

```bash
# Deploy completo
sls deploy

# Deploy de função específica
sls deploy function -f createMeal

# Visualizar logs
sls logs -f processMeal --t

# Desenvolvimento local
sls dev

# Remover stack
sls remove
```

## Troubleshooting

### Deploy falha com erro de permissão
- Verifique se as credenciais AWS estão configuradas corretamente;
- Confirme que o IAM user tem a política **AdministratorAccess**;
- Verifique se o Serverless Framework está logado: `sls login`.

### Upload de refeição não dispara processamento
- Verifique se o evento `ObjectCreated` está configurado no bucket S3;
- Confirme que a permissão `s3:GetObject` está configurada na Lambda `newMealUploadedTrigger`;
- Verifique os logs da Lambda no CloudWatch.

### Refeição fica com status FAILED
- Verifique os logs da Lambda `processMeal` no CloudWatch;
- Confirme que a `OPENAI_API_KEY` está configurada e é válida;
- Verifique se o formato do arquivo é suportado (imagens: JPEG, PNG; áudios: M4A, 3GP, WebM);
- Após 2 falhas, a refeição vai para a Dead Letter Queue e um email de alarme é enviado.

### Erro 401 / Token inválido
- Verifique se o header `Authorization: Bearer <token>` está sendo enviado;
- Confirme que o token não expirou (validade de 1 dia);
- Use o endpoint `/auth/refresh-token` para obter um novo token.

### Erro de CORS
- Verifique se o CORS está habilitado no `serverless.yml` (`httpApi.cors: true`);
- Para domínios de produção, configure o CORS no API Gateway;
- Após mudanças, faça novo deploy: `sls deploy`.

### Erro ao cadastrar usuário (Sign Up)
- Verifique se o `COGNITO_EMAIL` e `SES_SOURCE_ARN` estão configurados;
- Confirme que o SES está no modo production ou verificado para o email de destino;
- Verifique os logs da Lambda `signUp` no CloudWatch.

### Processamento de áudio falha
- Verifique se o arquivo de áudio não está corrompido;
- Confirme que o formato é suportado (M4A, 3GP, WebM);
- Verifique se a `OPENAI_API_KEY` tem acesso ao modelo `gpt-4o-mini-transcribe`.

### Alarme de Dead Letter Queue
- Verifique o email configurado em `DLQ_ALARM_EMAIL`;
- Analise os logs da Lambda `processMeal` para identificar a causa raiz;
- Verifique se há falhas de rede ou timeout na chamada à API do OpenAI;
