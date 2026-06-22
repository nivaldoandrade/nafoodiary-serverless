import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '@infra/clients/sqsClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class MealQueueGateway {

  constructor(
    private readonly config: AppConfig,
  ) { }

  async publish({
    accountId,
    mealId,
  }: MealQueueGateway.SendMessageMeal['input'],
  ) {
    const command = new SendMessageCommand({
      QueueUrl: this.config.queue.mealsQueueUrl,
      MessageBody: JSON.stringify({ accountId, mealId }),
    });

    await sqsClient.send(command);
  }
}

export namespace MealQueueGateway {
  export type SendMessageMeal = {
    input: {
      accountId: string;
      mealId: string;
    }
  }
}
