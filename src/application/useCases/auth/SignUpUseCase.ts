import { Account } from '@application/entities/Account';
import { Profile } from '@application/entities/Profile';
import { EmailAlreadyInUse } from '@application/errors/application/EmailAlreadyInUse';
import { GoalCalculator } from '@application/services/GoalCalculator';
import { AccountsRepository } from '@infra/databases/dynamodb/AccountsRepository';
import { SignUpUOW } from '@infra/databases/dynamodb/uow/SignUpUOW';
import { AuthGateway } from '@infra/gateways/AuthGateway';
import { Injectable } from '@kernel/decorators/Injectable';
import { generateUniqueId } from '@shared/utils/generateUniqueId';

@Injectable()
export class SignUpUseCase {

  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountsRepository: AccountsRepository,
    private readonly signUpUOW: SignUpUOW,
  ) { }

  async execute({ account: accountInput, profile: profileInput }: SignUpUseCase.Input,
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
      isOnboarded: true,
    });

    account.externalId = externalId;

    const profile = new Profile({
      accountId,
      ...profileInput,
    });

    const goal = GoalCalculator.calculate(profile);

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
    }
  }

  export type Output = {
    accessToken: string;
    refreshToken: string;
  }
}
