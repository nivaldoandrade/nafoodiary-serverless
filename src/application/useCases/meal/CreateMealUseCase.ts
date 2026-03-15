import { Meal } from '@application/entities/Meal';
import { MealRepository } from '@infra/databases/dynamodb/MealRepository';
import { Injectable } from '@kernel/decorators/Injectable';
import { generateUniqueId } from '@shared/utils/generateUniqueId';

@Injectable()
export class CreateMealUseCase {

  constructor(private readonly mealRepository: MealRepository) { }

  async execute({ accountId, file }: CreateMealUseCase.Input): Promise<CreateMealUseCase.Output> {
    const mealId = generateUniqueId();

    const meal = new Meal({
      id: mealId,
      accountId,
      inputType: file.inputType,
      inputFileKey: 'FILENAME-EXAMPLE',
      status: Meal.StatusType.UPLOADING,
    });

    await this.mealRepository.create(meal);

    return {
      mealId,
    };
  }
}

export namespace CreateMealUseCase {
  export type Input = {
    accountId: string;
    file: {
      inputType: Meal.InputType;
      size: number;
    }
  }

  export type Output = {
    mealId: string;
  }
}
