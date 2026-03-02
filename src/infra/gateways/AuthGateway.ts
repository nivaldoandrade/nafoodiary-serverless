import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@infra/clients/cognitoClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class AuthGateway {

  constructor(
    private readonly config: AppConfig,
  ) { }

  async signUp(
    params: AuthGateway.SignUp['params'],
  ): Promise<AuthGateway.SignUp['result']> {
    const { email, password } = params;

    const command = new SignUpCommand({
      ClientId: this.config.envAuth.cognito.clientId,
      Username: email,
      Password: password,
    });

    const { UserSub: externalId } = await cognitoClient.send(command);

    if (!externalId) {
      throw new Error(`Error signup user: ${email}`);
    }

    // Save externalId in the dynamoBD table

    return {
      externalId,
    };
  }
}

namespace AuthGateway {
  export type SignUp = {
    params: {
      email: string;
      password: string;
    },
    result: {
      externalId: string;
    }
  }
}
