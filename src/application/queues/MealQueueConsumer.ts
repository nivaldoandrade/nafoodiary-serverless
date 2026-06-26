import { ISQSHandler } from '@application/contracts/ISQSHandler';
import { ProcessMealUseCase } from '@application/useCases/meal/ProcessMealUseCase';
import { MealQueueGateway } from '@infra/gateways/MealQueueGateway';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class MealQueueConsumer implements ISQSHandler<MealQueueGateway.SendMessageMeal['input']> {

  constructor(
    private readonly processMealUseCase: ProcessMealUseCase,
  ) { }

  async handle({
    accountId,
    mealId,
  }: MealQueueGateway.SendMessageMeal['input']): Promise<void> {
    await this.processMealUseCase.execute({ accountId, mealId });
  }

}

export namespace MealQueueConsumer {
  export type Input = {
    accountId: string;
    mealId: string;
  }
}
