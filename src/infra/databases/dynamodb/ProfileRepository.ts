import { Profile } from '@application/entities/Profile';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { ProfileItem } from '@infra/databases/dynamodb/items/ProfileItem';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class ProfileRepository {

  constructor(private readonly config: AppConfig) { }

  async create(profile: Profile): Promise<void> {
    const profileItem = ProfileItem.fromEntity(profile);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: profileItem.getItem(),
    });

    await dynamodbClient.send(command);
  }
}
