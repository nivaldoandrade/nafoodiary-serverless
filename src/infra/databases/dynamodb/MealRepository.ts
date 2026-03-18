import { Meal } from '@application/entities/Meal';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { MealItem } from '@infra/databases/dynamodb/items/MealItem';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class MealRepository {

  constructor(private readonly config: AppConfig) { }

  async findById({ accountId, mealId }: MealRepository.FindByIdParams): Promise<Meal | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: MealItem.getPK({ accountId, mealId }),
        SK: MealItem.getSK(mealId),
      },
    });

    const { Item } = await dynamodbClient.send(command);

    if (!Item) {
      return null;
    }

    const mealItem = Item as MealItem.ItemType;

    const meal = MealItem.toEntity(mealItem);

    return meal;
  }

  async create(meal: Meal): Promise<void> {
    const mealItem = MealItem.fromEntity(meal);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: mealItem.getItem(),
    });

    await dynamodbClient.send(command);
  }

}

namespace MealRepository {

  export type FindByIdParams = {
    accountId: string;
    mealId: string;
  }
}
