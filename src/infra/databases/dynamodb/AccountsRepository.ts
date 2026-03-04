import { Account } from '@application/entities/Account';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class AccountsRepository {

  constructor(private readonly config: AppConfig) { }

  async create(account: Account): Promise<void> {
    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: {
        type: 'ACCOUNT',
        PK: `ACCOUNT#${account.id}`,
        SK: `ACCOUNT#${account.id}`,
        GS1PK: `ACCOUNT#${account.email}`,
        GS1SK: `ACCOUNT#${account.email}`,
        id: account.id,
        email: account.email,
        externalId: account.externalId,
      },
    });

    await dynamodbClient.send(command);
  }
}
