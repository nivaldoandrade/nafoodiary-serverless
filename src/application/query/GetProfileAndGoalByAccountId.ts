import { Profile } from '@application/entities/Profile';
import { ResourceNotFound } from '@application/errors/application/ResourceNotFound';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { AccountItem } from '@infra/databases/dynamodb/items/AccountItem';
import { GoalItem } from '@infra/databases/dynamodb/items/GoalItem';
import { ProfileItem } from '@infra/databases/dynamodb/items/ProfileItem';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class GetProfileAndGoalByAccountId {

  constructor(private readonly config: AppConfig) { }

  async execute(
    accountId: string,
  ): Promise<GetProfileAndGoalByAccountId.Output> {
    const PK = AccountItem.getPK(accountId);

    const command = new QueryCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Limit: 2,
      Select: 'SPECIFIC_ATTRIBUTES',
      ProjectionExpression: '#name, #birthDate, #gender, #height, #weight, #goal, #calories, #proteins, #carbohydrates, #fats, #type',
      KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
        '#name': 'name',
        '#birthDate': 'birthDate',
        '#gender': 'gender',
        '#height': 'height',
        '#weight': 'weight',
        '#goal': 'goal',
        '#calories': 'calories',
        '#proteins': 'proteins',
        '#carbohydrates': 'carbohydrates',
        '#fats': 'fats',
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':PK': PK,
        ':SK': `${PK}#`,
      },
    });

    const { Items = [] } = await dynamodbClient.send(command);

    const profile = Items.find((item): item is GetProfileAndGoalByAccountId.ProfileItemType => (
      item.type === ProfileItem.TYPE
    ));

    const goal = Items.find((item): item is GetProfileAndGoalByAccountId.GoalItemType => (
      item.type === GoalItem.TYPE
    ));

    if (!profile || !goal) {
      throw new ResourceNotFound('Account not found.');
    }

    const { type: _profileTye, ...restProfile } = profile;
    const { type: _goalTye, ...restGoal } = goal;

    return {
      profile: restProfile,
      goal: restGoal,
    };
  }
}

export namespace GetProfileAndGoalByAccountId {

  export type ProfileItemType = Pick<
    ProfileItem.ItemType,
    keyof Output['profile'] | 'type'
  >;

  export type GoalItemType = Pick<
    GoalItem.ItemType,
    keyof Output['goal'] | 'type'
  >;

  export type Output = {
    profile: {
      name: string;
      birthDate: string;
      gender: string;
      height: number;
      weight: number;
      goal: Profile.Goal;
    },
    goal: {
      calories: number;
      proteins: number;
      carbohydrates: number;
      fats: number;
    }
  }
}
