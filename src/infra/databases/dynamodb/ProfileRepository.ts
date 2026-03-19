import { Profile } from '@application/entities/Profile';
import { GetCommand, PutCommand, PutCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { ProfileItem } from '@infra/databases/dynamodb/items/ProfileItem';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class ProfileRepository {

  constructor(private readonly config: AppConfig) { }

  async findByAccountId(accountId: string): Promise<Profile | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: ProfileItem.getPK(accountId),
        SK: ProfileItem.getSK(accountId),
      },
    });

    const { Item } = await dynamodbClient.send(command);

    if (!Item) {
      return null;
    }

    const profileItem = Item as ProfileItem.ItemType;

    return ProfileItem.toEntity(profileItem);
  }

  async save(profile: Profile): Promise<void> {
    const profileItem = ProfileItem.fromEntity(profile).getItem();

    const command = new UpdateCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: ProfileItem.getPK(profile.accountId),
        SK: ProfileItem.getSK(profile.accountId),
      },
      ConditionExpression: 'attribute_exists(#PK)',
      UpdateExpression: 'SET #name = :name, #birthDate = :birthDate, #gender = :gender, #height = :height, #weight = :weight',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#name': 'name',
        '#birthDate': 'birthDate',
        '#gender': 'gender',
        '#height': 'height',
        '#weight': 'weight',
      },
      ExpressionAttributeValues: {
        ':name': profileItem.name,
        ':birthDate': profileItem.birthDate,
        ':gender': profileItem.gender,
        ':height': profileItem.height,
        ':weight': profileItem.weight,
      },
      ReturnValues: 'NONE',
    });

    await dynamodbClient.send(command);
  }

  getPutCommandInput(profile: Profile): PutCommandInput {
    const profileItem = ProfileItem.fromEntity(profile);

    return {
      TableName: this.config.db.dynamodb.mainTable,
      Item: profileItem.getItem(),
    };
  }

  async create(profile: Profile): Promise<void> {
    const putCommandInput = this.getPutCommandInput(profile);

    const command = new PutCommand(putCommandInput);

    await dynamodbClient.send(command);
  }
}
