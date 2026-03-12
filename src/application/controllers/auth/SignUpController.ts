import { Controller } from '@application/contracts/Controller';
import { SignUpBody, signUpSchema } from '@application/controllers/auth/schemas/signUpSchema';
import { SignUpUseCase } from '@application/useCases/auth/SignUpUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(signUpSchema)
export class SignUpController extends Controller<'public'> {

  constructor(
    private readonly signUpUseCase: SignUpUseCase,
  ) {
    super();
  }

  protected async handler(
    request: Controller.Request<'public', SignUpBody>,
  ): Promise<Controller.Response<SignUpController.Response>> {

    const { account, profile } = request.body;

    const { accessToken, refreshToken } = await this.signUpUseCase.execute({ account, profile });

    return {
      statusCode: 201,
      body: {
        accessToken,
        refreshToken,
      },
    };
  }

}

namespace SignUpController {
  export type Response = {
    accessToken: string;
    refreshToken: string;
  }
}
