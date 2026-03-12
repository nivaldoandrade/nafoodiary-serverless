import { Account } from '@application/entities/Account';
import { Goal } from '@application/entities/Goal';
import { Profile } from '@application/entities/Profile';
import { EmailAlreadyInUse } from '@application/errors/application/EmailAlreadyInUse';
import { AccountsRepository } from '@infra/databases/dynamodb/AccountsRepository';
import { AuthGateway } from '@infra/gateways/AuthGateway';
import { SignUpUOW } from '@infra/uow/SignUpUOW';
import { Injectable } from '@kernel/decorators/Injectable';
import { generateUniqueId } from '@shared/utils/generateUniqueId';

@Injectable()
export class SignUpUseCase {

  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountsRepository: AccountsRepository,
    private readonly signUpUOW: SignUpUOW,
  ) { }

  async execute(
    {
      account: accountInput,
      profile: profileInput,
      goal: goalInput,
    }: SignUpUseCase.Input,
  ): Promise<SignUpUseCase.Output> {

    const { email, password } = accountInput;

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

    const profile = new Profile({
      accountId,
      ...profileInput,
    });

    const goal = new Goal({
      accountId,
      ...goalInput,
    });

    try {
      await this.signUpUOW.run({ account, goal, profile });

      const { accessToken, refreshToken } = await this.authGateway.signIn({ email, password });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (externalId) {
        await this.authGateway.deleteUser(email);
      }

      throw error;
    }
  }
}

namespace SignUpUseCase {

  export type Input = {
    account: {
      email: string;
      password: string;
    },
    profile: {
      name: string;
      birthDate: Date;
      gender: Profile.Gender;
      height: number;
      weight: number;
      activityLevel: Profile.ActivityLevel;
      goal: Profile.Goal;
    },
    goal: {
      calories: number;
      proteins: number;
      carbohydrates: number;
      fats: number;
    }
  }

  export type Output = {
    accessToken: string;
    refreshToken: string;
  }
}
