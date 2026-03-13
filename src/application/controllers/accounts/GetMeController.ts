import { Controller } from '@application/contracts/Controller';
import { GetProfileAndGoalByAccountId } from '@application/query/GetProfileAndGoalByAccountId';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class GetMeController extends Controller<'private'> {

  constructor(
    private readonly getProfileAndGoaByAccountId: GetProfileAndGoalByAccountId,
  ) {
    super();
  }

  protected async handler(request: Controller.RequestPrivate): Promise<Controller.Response> {

    const accountId = request.accountId;

    const { profile, goal } = await this.getProfileAndGoaByAccountId.execute(accountId);

    return {
      statusCode: 200,
      body: {
        profile,
        goal,
      },
    };
  }
}

namespace GetMeController {

  export type Response = {
    profile: {
      name: string;
      birthDate: string;
      gender: string;
      height: number;
      weight: number;
    },
    goal: {
      calories: number;
      proteins: number;
      carbohydrates: number;
      fats: number;
    }
  }
}
