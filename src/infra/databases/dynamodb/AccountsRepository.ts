import { Account } from '@application/entities/Account';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { AccountItem } from '@infra/databases/dynamodb/items/AccountItem';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class AccountsRepository {

  constructor(private readonly config: AppConfig) { }

  async create(account: Account): Promise<void> {
    const accountItem = AccountItem.fromEntity(account);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: accountItem.getItem(),
    });

    await dynamodbClient.send(command);
  }
}
