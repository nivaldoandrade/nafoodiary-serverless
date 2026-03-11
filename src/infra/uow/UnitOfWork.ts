import { PutCommandInput, TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';

export abstract class UnitOfWork {

  private transactItems: NonNullable<TransactWriteCommandInput['TransactItems']> = [];

  protected registerPut(putCommand: PutCommandInput) {
    this.transactItems.push({ Put: putCommand });
  }

  protected async commit() {
    const command = new TransactWriteCommand({
      TransactItems: this.transactItems,
    });

    await dynamodbClient.send(command);
  }

}
