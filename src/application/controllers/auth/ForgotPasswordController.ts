import { Controller } from '@application/contracts/Controller';
import { ForgotPasswordBody, forgotPasswordSchema } from '@application/controllers/auth/schemas/forgotPasswordSchema';
import { ForgotPasswordUseCase } from '@application/useCases/auth/ForgotPasswordUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(forgotPasswordSchema)
export class ForgotPasswordController extends Controller<'public'> {

  constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {
    super();
  }

  protected async handler(request: Controller.RequestPublic<ForgotPasswordBody>): Promise<Controller.Response> {
    try {
      const { email } = request.body;
      await this.forgotPasswordUseCase.execute(email);
    } catch {
      // continue regardless of error
    }

    return {
      statusCode: 204,
    };
  }
}
