import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@infra/clients/cognitoClient';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class AuthGateway {

  async signUp(
    params: AuthGateway.SignUp['params'],
  ): Promise<AuthGateway.SignUp['result']> {
    const { email, password } = params;

    const command = new SignUpCommand({
      ClientId: '',
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
