import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class SignUpUseCase {

  async execute(
    { email, password }: SignUpUseCase.Input,
  ): Promise<SignUpUseCase.Output> {

    console.log({ email, password });

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
