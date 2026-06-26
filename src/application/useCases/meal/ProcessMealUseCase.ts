import { Meal } from '@application/entities/Meal';
import { MealRepository } from '@infra/databases/dynamodb/MealRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class ProcessMealUseCase {

  constructor(
    private readonly mealRepository: MealRepository,
  ) { }

  async execute({ accountId, mealId }: ProcessMealUseCase.Input): Promise<void> {
    const meal = await this.mealRepository.findById({
      accountId,
      mealId,
    });

    if (!meal) {
      throw new Error(`Meal ${mealId} not found.`);
    }

    if (meal.status === Meal.StatusType.UPLOADING) {
      throw new Error(`Meal ${mealId} is still uploading.`);
    }

    if (meal.status === Meal.StatusType.PROCESSING) {
      throw new Error(`Meal ${mealId} is being processed.`);
    }

    if (meal.status === Meal.StatusType.SUCCESS) {
      return;
    }

    try {
      meal.status = Meal.StatusType.PROCESSING;
      meal.attempts += 1;
      await this.mealRepository.save(meal);

      // PROCESSAR NA AI
      meal.status = Meal.StatusType.SUCCESS;
      meal.name = 'Almoço';
      meal.icon = '🍲';
      meal.foods = [{
        calories: '100',
        carbohydrates: '50',
        fats: '75',
        name: 'Arroz branco',
        proteins: '30',
        quantity: '2 porções',
      }];

      await this.mealRepository.save(meal);

    } catch (error) {
      meal.status = meal.attempts > Meal.MAX_ATTEMPS
        ? Meal.StatusType.QUEUED
        : Meal.StatusType.FAILED;

      await this.mealRepository.save(meal);

      throw error;
    }

  }
}

export namespace ProcessMealUseCase {
  export type Input = {
    accountId: string;
    mealId: string;
  }

}
