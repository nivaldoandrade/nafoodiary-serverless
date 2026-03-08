import { Account } from '@application/entities/Account';
import { EmailAlreadyInUse } from '@application/errors/application/EmailAlreadyInUse';
import { AccountsRepository } from '@infra/databases/dynamodb/AccountsRepository';
import { AuthGateway } from '@infra/gateways/AuthGateway';
import { Injectable } from '@kernel/decorators/Injectable';
import { generateUniqueId } from '@shared/utils/generateUniqueId';

@Injectable()
export class SignUpUseCase {

  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountsRepository: AccountsRepository,
  ) { }

  async execute(
    { email, password }: SignUpUseCase.Input,
  ): Promise<SignUpUseCase.Output> {
    const emailIsAlreadyInUse = await this.accountsRepository.findByEmail(email);

    if (emailIsAlreadyInUse) {
      throw new EmailAlreadyInUse();
    }

    const accountId = generateUniqueId();

    const { externalId } = await this.authGateway.signUp({
      internalId: accountId,
      email,
      password,
    });

    const account = new Account({
      id: accountId,
      email,
      externalId,
    });

    account.externalId = externalId;

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
