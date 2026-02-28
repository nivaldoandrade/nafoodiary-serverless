import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class HelloUseCase {

  async execute({ email }: HelloUseCase.Input): Promise<HelloUseCase.Output> {

    return {
      helloUseCase: email,
    };

  }
}

namespace HelloUseCase {
  export type Input = {
    email: string;
  }

  export type Output = {
    helloUseCase: string;
  }
}
