import { ISQSHandler } from '@application/contracts/ISQSHandler';
import { MealQueueGateway } from '@infra/gateways/MealQueueGateway';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class MealQueueConsumer implements ISQSHandler<MealQueueGateway.SendMessageMeal['input']> {

  async handle({
    accountId,
    mealId,
  }: MealQueueGateway.SendMessageMeal['input']): Promise<void> {
    console.log({
      accountId,
      mealId,
    });
  }

}

export namespace MealQueueConsumer {
  export type Input = {
    accountId: string;
    mealId: string;
  }
}
