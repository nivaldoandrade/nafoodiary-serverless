import { Account } from '@application/entities/Account';
import { InvalidOAuthGrant } from '@application/errors/application/InvalidOAuthGrant';
import { AccountsRepository } from '@infra/databases/dynamodb/AccountsRepository';
import { AuthGateway } from '@infra/gateways/AuthGateway';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class OAuthCallbackUseCase {

  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountsRepository: AccountsRepository,
  ) { }

  async execute({
    code,
    redirect_uri,
    code_verifier,
  }: OAuthCallbackUseCase.Input): Promise<OAuthCallbackUseCase.Output> {
    const { accessToken, refreshToken } = await this.authGateway.exchangeCodeForTokens({
      code,
      redirect_uri,
      code_verifier,
    });

    const { email, externalId, internalId } = await this.authGateway.getUser(accessToken);

    if (!email || !externalId || !internalId) {
      throw new InvalidOAuthGrant('Missing user data from token.');
    }

    const existingAccount = await this.accountsRepository.findByEmail(email);

    if (!existingAccount) {
      const newAccount = new Account({
        id: internalId,
        email,
        externalId,
        isOnboarded: false,
      });

      await this.accountsRepository.create(newAccount);
    }

    return {
      isOnboarded: existingAccount?.isOnboarded ?? false,
      accessToken,
      refreshToken,
    };
  }
}

export namespace OAuthCallbackUseCase {
  export type Input = {
    code: string;
    redirect_uri: string;
    code_verifier: string;
  }

  export type Output = {
    isOnboarded: boolean;
    accessToken: string;
    refreshToken: string;
  }
}
