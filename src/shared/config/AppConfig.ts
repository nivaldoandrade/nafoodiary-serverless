import { Injectable } from '@kernel/decorators/Injectable';
import { env } from '@shared/config/env';

@Injectable()
export class AppConfig {
  readonly envAuth: AppConfig.EnvAuth;

  constructor() {
    this.envAuth = {
      cognito: {
        clientId: env.COGNITO_CLIENT_ID,
      },
    };
  }

}

namespace AppConfig {
  export type EnvAuth = {
    cognito: {
      clientId: string;
    }
  }
}
