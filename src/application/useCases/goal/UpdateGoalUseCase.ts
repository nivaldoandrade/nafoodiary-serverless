import { ResourceNotFound } from '@application/errors/application/ResourceNotFound';
import { GoalRepository } from '@infra/databases/dynamodb/GoalRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class UpdateGoalUseCase {

  constructor(
    private readonly goalRepository: GoalRepository,
  ) { }

  async execute(input: UpdateGoalUseCase.Input): Promise<void> {
    const goal = await this.goalRepository.findByAccountId(input.accountId);

    if (!goal) {
      throw new ResourceNotFound('Goal not found.');
    }

    goal.calories = input.calories;
    goal.carbohydrates = input.carbohydrates;
    goal.proteins = input.proteins;
    goal.fats = input.fats;

    await this.goalRepository.save(goal);
  }
}

namespace UpdateGoalUseCase {
  export type Input = {
    accountId: string
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
  }
}
