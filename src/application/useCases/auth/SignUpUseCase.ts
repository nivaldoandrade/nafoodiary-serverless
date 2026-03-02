import { AuthGateway } from '@infra/gateways/AuthGateway';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class SignUpUseCase {

  constructor(private readonly authGateway: AuthGateway) { }

  async execute(
    { email, password }: SignUpUseCase.Input,
  ): Promise<SignUpUseCase.Output> {

    await this.authGateway.signUp({ email, password });

    return {
      accessToken: 'AccessToken gerado...',
      refreshToken: 'RefreshToken gerado...',
    };
  }
}

namespace SignUpUseCase {

  export type Input = {
    email: string;
    password: string;
  }

  export type Output = {
    accessToken: string;
    refreshToken: string;
  }
}
