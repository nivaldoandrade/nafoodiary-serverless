import { Controller } from '@application/contracts/Controller';
import { CompleteOnboardingBody, completeOnboardingSchema } from '@application/controllers/auth/schemas/completeOnboardingSchema';
import { CompleteOnboardingUseCase } from '@application/useCases/auth/CompleteOnboardingUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(completeOnboardingSchema)
export class CompleteOnboardingController extends Controller<'public'> {

  constructor(
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
  ) {
    super();
  }

  protected async handler(request: Controller.RequestPublic<CompleteOnboardingBody>): Promise<Controller.Response> {
    const body = request.body;

    await this.completeOnboardingUseCase.execute(body);

    return {
      statusCode: 204,
    };
  }
}
