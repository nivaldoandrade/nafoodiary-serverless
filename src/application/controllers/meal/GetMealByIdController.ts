import { Controller } from '@application/contracts/Controller';
import { Meal } from '@application/entities/Meal';
import { GetMealByIdUseCase } from '@application/useCases/meal/GetMealByIdUseCase';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class GetMealByIdController extends Controller<'private'> {

  constructor(
    private readonly getMealByIdUseCase: GetMealByIdUseCase,
  ) {
    super();
  }

  protected async handler(
    request: GetMealByIdController.Request,
  ): Promise<Controller.Response<GetMealByIdController.Response>> {
    const { id } = request.params;

    const { meal } = await this.getMealByIdUseCase.execute({
      mealId: id,
    });

    return {
      statusCode: 200,
      body: {
        id: meal.id,
        name: meal.name,
        icon: meal.icon,
        status: meal.status,
        foods: meal.foods,
        inputFileKey: meal.inputFileKey,
        inputType: meal.inputType,
        createdAt: meal.createdAt,
      },
    };
  }
}

export namespace GetMealByIdController {

  export type Request = Controller.RequestPrivate<
    Record<string, unknown>,
    { id: string }
  >

  export type Response = {
    id: string;
    status: Meal.StatusType;
    inputFileKey: string;
    inputType: Meal.InputType;
    name: string;
    icon: string;
    foods: Meal.FoodType[];
    createdAt?: Date;
  }
}
