import { Profile } from '@application/entities/Profile';
import { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { ProfileItem } from '@infra/databases/dynamodb/items/ProfileItem';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class ProfileRepository {

  constructor(private readonly config: AppConfig) { }

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
