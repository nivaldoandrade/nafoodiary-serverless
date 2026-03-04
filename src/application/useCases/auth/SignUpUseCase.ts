import { Account } from '@application/entities/Account';
import { AccountsRepository } from '@infra/databases/dynamodb/AccountsRepository';
import { AuthGateway } from '@infra/gateways/AuthGateway';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class SignUpUseCase {

  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountsRepository: AccountsRepository,
  ) { }

  async execute(
    { email, password }: SignUpUseCase.Input,
  ): Promise<SignUpUseCase.Output> {

    const { externalId } = await this.authGateway.signUp({ email, password });

    const account = new Account({ email, externalId });

    await this.accountsRepository.create(account);

    const { accessToken, refreshToken } = await this.authGateway.signIn({ email, password });

    return {
      accessToken,
      refreshToken,
    };
  }
}

namespace SignUpUseCase {

  export type Input = {
    email: string;
    password: string;
  }

  export type Output = {
    accessToken: string;
    refreshToken: string;
  }
}
