import { createHmac } from 'node:crypto';

import { GetTokensFromRefreshTokenCommand, InitiateAuthCommand, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@infra/clients/cognitoClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class AuthGateway {

  constructor(
    private readonly config: AppConfig,
  ) { }

  async signIn({ email, password }: AuthGateway.SignIn['params']): Promise<AuthGateway.SignIn['result']> {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.config.envAuth.cognito.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: this.getSecretHash(email),
      },

    });

    const { AuthenticationResult } = await cognitoClient.send(command);

    if (!AuthenticationResult?.AccessToken || !AuthenticationResult.RefreshToken) {
      throw new Error(`Error signin user: ${email}`);
    }

    return {
      accessToken: AuthenticationResult.AccessToken,
      refreshToken: AuthenticationResult.RefreshToken,
    };

  }

  async signUp(
    params: AuthGateway.SignUp['params'],
  ): Promise<AuthGateway.SignUp['result']> {
    const { internalId, email, password } = params;

    const command = new SignUpCommand({
      ClientId: this.config.envAuth.cognito.clientId,
      Username: email,
      Password: password,
      SecretHash: this.getSecretHash(email),
      UserAttributes: [
        {
          Name: 'custom:internalId',
          Value: internalId,
        },
      ],
    });

    const { UserSub: externalId } = await cognitoClient.send(command);

    if (!externalId) {
      throw new Error(`Error signup user: ${email}`);
    }

    return {
      externalId,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthGateway.SignIn['result']> {
    const getTokensCommand = new GetTokensFromRefreshTokenCommand({
      RefreshToken: refreshToken,
      ClientId: this.config.envAuth.cognito.clientId,
      ClientSecret: this.config.envAuth.cognito.clientSecret,
    });

    const { AuthenticationResult } = await cognitoClient.send(getTokensCommand);

    if (!AuthenticationResult?.AccessToken || !AuthenticationResult.RefreshToken) {
      throw new Error('rror refresh token user.');
    }

    return {
      accessToken: AuthenticationResult.AccessToken,
      refreshToken: AuthenticationResult.RefreshToken,
    };
  }

  private getSecretHash(email: string): string {
    const clientId = this.config.envAuth.cognito.clientId;
    const clientSecret = this.config.envAuth.cognito.clientSecret;

    return createHmac('SHA256', clientSecret)
      .update(`${email}${clientId}`)
      .digest('base64');
  }
}

namespace AuthGateway {
  export type SignUp = {
    params: {
      internalId: string;
      email: string;
      password: string;
    },
    result: {
      externalId: string;
    }
  }

  export type SignIn = {
    params: {
      email: string;
      password: string;
    },
    result: {
      accessToken: string;
      refreshToken: string;
    }
  }
}
