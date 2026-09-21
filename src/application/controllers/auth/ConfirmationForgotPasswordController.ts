import { Controller } from '@application/contracts/Controller';
import { ConfirmationForgotPasswordBody, confirmationForgotPasswordSchema } from '@application/controllers/auth/schemas/confirmationForgotPasswordSchema';
import { BadRequest } from '@application/errors/http/BadRequest';
import { ConfirmationForgotPasswordUseCase } from '@application/useCases/auth/ConfirmForgotPasswordUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { RateLimit } from '@kernel/decorators/RateLimit';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(confirmationForgotPasswordSchema)
@RateLimit({ scope: 'ip', limit: 10, windowSeconds: 900 })
export class ConfirmationForgotPasswordController extends Controller<'public'> {

  constructor(private readonly confirmationForgotPasswordUseCase: ConfirmationForgotPasswordUseCase) {
    super();
  }

  protected async handler(request: Controller.RequestPublic<ConfirmationForgotPasswordBody>): Promise<Controller.Response> {
    try {
      const { email, password, confirmationCode } = request.body;

      await this.confirmationForgotPasswordUseCase.execute({
        email,
        password,
        confirmationCode,
      });

      return {
        statusCode: 204,
      };

    } catch {
      throw new BadRequest(
        'Invalid code provided, please request a code again',
      );
    }
  }
}
