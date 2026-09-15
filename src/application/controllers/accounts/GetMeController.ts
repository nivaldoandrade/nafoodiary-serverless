import { Controller } from '@application/contracts/Controller';
import { Profile } from '@application/entities/Profile';
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

    const { isOnboarded, profile, goal } = await this.getProfileAndGoaByAccountId.execute(accountId);

    return {
      statusCode: 200,
      body: {
        isOnboarded,
        profile,
        goal,
      },
    };
  }
}

namespace GetMeController {

  export type Response = {
    isOnboarded: boolean;
    profile: {
      name: string;
      birthDate: string;
      gender: string;
      height: number;
      weight: number;
      goal: Profile.Goal;
    } | null,
    goal: {
      calories: number;
      proteins: number;
      carbohydrates: number;
      fats: number;
    } | null
  }
}
