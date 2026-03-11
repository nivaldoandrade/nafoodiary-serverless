import { Goal } from '@application/entities/Goal';
import { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { GoalItem } from '@infra/databases/dynamodb/items/GoalItem';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class GoalRepository {

  constructor(private readonly config: AppConfig) { }

  getPutCommandInput(goal: Goal): PutCommandInput {
    const goalItem = GoalItem.fromEntity(goal);

    return {
      TableName: this.config.db.dynamodb.mainTable,
      Item: goalItem.getItem(),
    };

  }

  async create(goal: Goal): Promise<void> {

    const putCommandInput = this.getPutCommandInput(goal);

    const command = new PutCommand(putCommandInput);

    await dynamodbClient.send(command);
  }
}
