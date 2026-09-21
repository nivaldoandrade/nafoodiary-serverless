
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbClient } from '@infra/clients/dynamodbClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class RateLimitRepository {

  constructor(private readonly config: AppConfig) { }

  async increment({
    scope,
    key,
    windowSeconds,
    limit,
  }: RateLimitRepository.IncrementParams): Promise<number | null> {
    const now = Math.floor(Date.now() / 1000);
    const bucketStart = Math.floor(now / windowSeconds) * windowSeconds;

    const command = new UpdateCommand({
      TableName: this.config.db.dynamodb.rateLimitTable,
      Key: {
        PK: `RL#${scope}#${key}`,
        SK: String(bucketStart),
      },
      UpdateExpression: 'ADD #count :inc SET #expiresAt = :expiresAt',
      ConditionExpression: 'attribute_not_exists(#count) OR #count < :max',
      ExpressionAttributeNames: {
        '#count': 'count',
        '#expiresAt': 'expiresAt',
      },
      ExpressionAttributeValues: {
        ':inc': 1,
        ':expiresAt': bucketStart + windowSeconds,
        ':max': limit,
      },
      ReturnValues: 'UPDATED_NEW',
    });

    try {
      const { Attributes } = await dynamodbClient.send(command);

      return (Attributes?.count as number) ?? null;
    } catch (error) {
      console.error(error);
      if (error instanceof ConditionalCheckFailedException) {
        return null;
      }

      throw error;
    }
  }
}

export namespace RateLimitRepository {
  export type IncrementParams = {
    scope: 'ip' | 'account' | 'email';
    key: string;
    windowSeconds: number;
    limit: number;
  }
}

