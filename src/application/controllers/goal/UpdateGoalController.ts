import { Controller } from '@application/contracts/Controller';
import { UpdateGoalSchema, updateGoalSchema } from '@application/controllers/goal/schemas/updateGoalSchema';
import { UpdateGoalUseCase } from '@application/useCases/goal/UpdateGoalUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(updateGoalSchema)
export class UpdateGoalController extends Controller<'private'> {

  constructor(
    private readonly updateGoalUseCase: UpdateGoalUseCase,
  ) {
    super();
  }

  protected async handler(request: Controller.RequestPrivate<UpdateGoalSchema>): Promise<Controller.Response> {
    const accountId = request.accountId;
    const body = request.body;

    await this.updateGoalUseCase.execute({ accountId, ...body });

    return {
      statusCode: 204,
    };
  }
}
