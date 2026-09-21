import { Controller } from '@application/contracts/Controller';
import { ForgotPasswordBody, forgotPasswordSchema } from '@application/controllers/auth/schemas/forgotPasswordSchema';
import { ForgotPasswordUseCase } from '@application/useCases/auth/ForgotPasswordUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { RateLimit } from '@kernel/decorators/RateLimit';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(forgotPasswordSchema)
@RateLimit({ scope: 'ip', limit: 5, windowSeconds: 900 })
@RateLimit({ scope: 'email', field: 'email', limit: 5, windowSeconds: 3600 })
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
