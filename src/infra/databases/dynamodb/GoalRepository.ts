import { Goal } from '@application/entities/Goal';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { GoalItem } from '@infra/databases/dynamodb/items/GoalItem';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class GoalRepository {

  constructor(private readonly config: AppConfig) { }

  async create(goal: Goal): Promise<void> {
    const goalItem = GoalItem.fromEntity(goal);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: goalItem.getItem(),
    });

    await dynamodbClient.send(command);
  }
}
