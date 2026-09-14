import { EmailAlreadyInUse } from '@application/errors/application/EmailAlreadyInUse';
import { InvalidOAuthGrant } from '@application/errors/application/InvalidOAuthGrant';
import { Account } from '@application/entities/Account';
import { Profile } from '@application/entities/Profile';
import { GoalCalculator } from '@application/services/GoalCalculator';
import { AccountsRepository } from '@infra/databases/dynamodb/AccountsRepository';
import { SignUpUOW } from '@infra/databases/dynamodb/uow/SignUpUOW';
import { AuthGateway } from '@infra/gateways/AuthGateway';
import { Injectable } from '@kernel/decorators/Injectable';
import { generateUniqueId } from '@shared/utils/generateUniqueId';

@Injectable()
export class CompleteOnboardingUseCase {

  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountsRepository,
    private readonly signUpUOW: SignUpUOW,
  ) { }

  async execute(input: CompleteOnboardingUseCase.Input) {
    const { accessToken, ...profileInput } = input;

    const {
      name,
      email,
      externalId,
    } = await this.authGateway.getUser(accessToken);

    if (!name || !email || !externalId) {
      throw new InvalidOAuthGrant('Missing user data from token.');
    }

    const existingAccount = await this.accountRepository.findByEmail(email);

    if (existingAccount && existingAccount.externalId === externalId) {
      return;
    }

    if (existingAccount) {
      throw new EmailAlreadyInUse();
    }

    const accountId = generateUniqueId();

    const account = new Account({
      id: accountId,
      email,
      externalId,
    });

    const profile = new Profile({
      accountId,
      ...profileInput,
      name,
    });

    const goal = GoalCalculator.calculate(profile);

    await this.authGateway.saveInternalId({ externalId, internalId: accountId });

    try {
      await this.signUpUOW.run({ account, goal, profile });
    } catch (error) {
      await this.authGateway.deleteInternalId(externalId);

      throw error;
    }
  }
}

namespace CompleteOnboardingUseCase {

  export type Input = {
    accessToken: string;
    birthDate: Date;
    gender: Profile.Gender;
    height: number;
    weight: number;
    activityLevel: Profile.ActivityLevel;
    goal: Profile.Goal;
  }
}
