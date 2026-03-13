import { Account } from '@application/entities/Account';
import { Goal } from '@application/entities/Goal';
import { Profile } from '@application/entities/Profile';
import { AccountsRepository } from '@infra/databases/dynamodb/AccountsRepository';
import { GoalRepository } from '@infra/databases/dynamodb/GoalRepository';
import { ProfileRepository } from '@infra/databases/dynamodb/ProfileRepository';
import { UnitOfWork } from '@infra/databases/dynamodb/uow/UnitOfWork';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class SignUpUOW extends UnitOfWork {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly goalRepository: GoalRepository,
  ) {
    super();
  }

  async run({ account, goal, profile }: SignUpUOW.RunParams) {
    this.registerPut(this.accountsRepository.getPutCommandInput(account));
    this.registerPut(this.profileRepository.getPutCommandInput(profile));
    this.registerPut(this.goalRepository.getPutCommandInput(goal));

    await this.commit();
  }
}

namespace SignUpUOW {
  export type RunParams = {
    account: Account;
    profile: Profile;
    goal: Goal;
  }
}
