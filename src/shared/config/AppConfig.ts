import { Injectable } from '@kernel/decorators/Injectable';
import { env } from '@shared/config/env';

@Injectable()
export class AppConfig {
  readonly envAuth: AppConfig.EnvAuth;

  readonly db: AppConfig.Db;

  constructor() {
    this.envAuth = {
      cognito: {
        clientId: env.COGNITO_CLIENT_ID,
        userPoolId: env.COGNITO_USER_POOL_ID,
        clientSecret: env.COGNITO_CLIENT_SECRET,
      },
    };

    this.db = {
      dynamodb: {
        mainTable: env.MAIN_TABLE_NAME,
      },
    };
  }

}

namespace AppConfig {
  export type EnvAuth = {
    cognito: {
      clientId: string;
      userPoolId: string;
      clientSecret: string;
    }
  }

  export type Db = {
    dynamodb: {
      mainTable: string;
    }
  }
}
