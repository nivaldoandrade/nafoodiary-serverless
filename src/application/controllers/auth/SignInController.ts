import { Controller } from '@application/contracts/Controller';
import { SignInBody, signInSchema } from '@application/controllers/auth/schemas/signInSchema';
import { SignInUseCase } from '@application/useCases/auth/SignInUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(signInSchema)
export class SignInController extends Controller {

  constructor(
    private readonly signInUseCase: SignInUseCase,
  ) {
    super();
  }

  protected async handler(request: Controller.Request<SignInBody>): Promise<Controller.Response<SignInController.Response>> {

    const { email, password } = request.body;

    const { accessToken, refreshToken } = await this.signInUseCase.execute({ email, password });

    return {
      statusCode: 200,
      body: {
        accessToken,
        refreshToken,
      },
    };
  }

}

namespace SignInController {
  export type Response = {
    accessToken: string;
    refreshToken: string;
  }
}
