import { Goal } from '@application/entities/Goal';
import { GetCommand, PutCommand, PutCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { GoalItem } from '@infra/databases/dynamodb/items/GoalItem';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class GoalRepository {

  constructor(private readonly config: AppConfig) { }

  async findByAccountId(accountId: string): Promise<Goal | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: GoalItem.getPK(accountId),
        SK: GoalItem.getSK(accountId),
      },

    });

    const { Item } = await dynamodbClient.send(command);

    if (!Item) {
      return null;
    }

    const goalItem = Item as GoalItem.ItemType;

    return GoalItem.toEntity(goalItem);
  }

  async save(goal: Goal): Promise<void> {

    const goalItem = GoalItem.fromEntity(goal).getItem();

    const command = new UpdateCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: GoalItem.getPK(goal.accountId),
        SK: GoalItem.getSK(goal.accountId),
      },
      ConditionExpression: 'attribute_exists(#PK)',
      UpdateExpression: 'SET #calories = :calories, #proteins = :proteins, #carbohydrates = :carbohydrates, #fats = :fats',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#calories': 'calories',
        '#proteins': 'proteins',
        '#carbohydrates': 'carbohydrates',
        '#fats': 'fats',
      },
      ExpressionAttributeValues: {
        ':calories': goalItem.calories,
        ':proteins': goalItem.proteins,
        ':carbohydrates': goalItem.carbohydrates,
        ':fats': goalItem.fats,
      },
      ReturnValues: 'NONE',
    });

    await dynamodbClient.send(command);

  }

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
