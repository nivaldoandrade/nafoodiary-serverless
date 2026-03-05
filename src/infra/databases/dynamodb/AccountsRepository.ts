import { Account } from '@application/entities/Account';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { AccountItem } from '@infra/databases/dynamodb/items/AccountItem';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class AccountsRepository {

  constructor(private readonly config: AppConfig) { }

  async findByEmail(email: string): Promise<Account | null> {
    const command = new QueryCommand({
      TableName: this.config.db.dynamodb.mainTable,
      IndexName: 'GSI1',
      Limit: 1,
      KeyConditionExpression: '#GSI1PK = :GSI1PK AND #GSI1SK = :GSI1SK',
      ExpressionAttributeNames: {
        '#GSI1PK': 'GSI1PK',
        '#GSI1SK': 'GSI1SK',
      },
      ExpressionAttributeValues: {
        ':GSI1PK': AccountItem.getGSI1PK(email),
        ':GSI1SK': AccountItem.getGSI1SK(email),
      },
      Select: 'SPECIFIC_ATTRIBUTES',
      ProjectionExpression: 'id, email, externalId, createdAt',
    });

    const { Items = [] } = await dynamodbClient.send(command);
    const accountItem = Items[0] as AccountItem.Attributes;

    if (!accountItem) {
      return null;
    }

    return AccountItem.toEntity(accountItem);
  }

  async create(account: Account): Promise<void> {
    const accountItem = AccountItem.fromEntity(account);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: accountItem.getItem(),
    });

    await dynamodbClient.send(command);
  }
}
