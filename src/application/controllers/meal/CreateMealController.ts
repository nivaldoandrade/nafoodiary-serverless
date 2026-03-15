import { Controller } from '@application/contracts/Controller';
import { CreateMealBody, createMealSchema } from '@application/controllers/meal/schemas/createMealSchema';
import { Meal } from '@application/entities/Meal';
import { CreateMealUseCase } from '@application/useCases/meal/CreateMealUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(createMealSchema)
export class CreateMealController extends Controller<'private'> {

  constructor(private readonly createMealUseCase: CreateMealUseCase) {
    super();
  }

  protected async handler(request: Controller.RequestPrivate<CreateMealBody>): Promise<Controller.Response<CreateMealController.Response>> {
    const accountId = request.accountId;
    const { contentType, fileSize } = request.body;

    const inputType = (
      contentType === 'audio/m4a'
        ? Meal.InputType.AUDIO
        : Meal.InputType.PICTURE
    );

    const { mealId } = await this.createMealUseCase.execute({
      accountId,
      file: {
        inputType,
        size: fileSize,
      },
    });

    return {
      statusCode: 201,
      body: {
        mealId,
      },
    };
  }

}

namespace CreateMealController {
  export type Response = {
    mealId: string;
  }
}
