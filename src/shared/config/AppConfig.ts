import { Injectable } from '@kernel/decorators/Injectable';
import { env } from '@shared/config/env';

@Injectable()
export class AppConfig {
  readonly envAuth: AppConfig.EnvAuth;

  readonly db: AppConfig.Db;

  readonly storage: AppConfig.Storage;

  readonly cdn: AppConfig.CDN;

  readonly queue: AppConfig.Queue;

  constructor() {
    this.envAuth = {
      cognito: {
        clientId: env.COGNITO_CLIENT_ID,
        userPoolId: env.COGNITO_USER_POOL_ID,
        clientSecret: env.COGNITO_CLIENT_SECRET,
        userPooldomain: env.COGNITO_POOL_DOMAIN,
      },
    };

    this.db = {
      dynamodb: {
        mainTable: env.MAIN_TABLE_NAME,
        rateLimitTable: env.RATE_LIMIT_TABLE_NAME,
      },
    };

    this.storage = {
      mealsBucketName: env.MEALS_BUCKET_NAME,
    };

    this.cdn = {
      mealsCDN: env.MEALS_CDN_DOMAIN_NAME,
    };

    this.queue = {
      mealsQueueUrl: env.MEALS_QUEUE_URL,
    };
  }

}

namespace AppConfig {
  export type EnvAuth = {
    cognito: {
      clientId: string;
      userPoolId: string;
      clientSecret: string;
      userPooldomain: string;
    }
  }

  export type Db = {
    dynamodb: {
      mainTable: string;
      rateLimitTable: string;
    }
  }

  export type Storage = {
    mealsBucketName: string;
  }

  export type CDN = {
    mealsCDN: string;
  }

  export type Queue = {
    mealsQueueUrl: string;
  }
}
