import { Meal } from '@application/entities/Meal';
import { ResourceNotFound } from '@application/errors/application/ResourceNotFound';
import { MealRepository } from '@infra/databases/dynamodb/MealRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class GetMealByIdUseCase {

  constructor(private readonly mealRepository: MealRepository) { }

  async execute({ mealId }: GetMealByIdUseCase.Input): Promise<GetMealByIdUseCase.Output> {
    const meal = await this.mealRepository.findById(mealId);

    if (!meal) {
      throw new ResourceNotFound('Meal not found.');
    }

    return { meal };
  }
}

namespace GetMealByIdUseCase {
  export type Input = {
    mealId: string;
  }

  export type Output = {
    meal: Meal
  }
}
