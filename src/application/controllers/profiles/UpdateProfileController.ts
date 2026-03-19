import { Controller } from '@application/contracts/Controller';
import { UpdatedProfileBody, updateProfileSchema } from '@application/controllers/profiles/schemas/updateProfileSchema';
import { UpdateProfileUseCase } from '@application/useCases/profile/UpdateProfileUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(updateProfileSchema)
export class UpdateProfileController extends Controller<'private'> {

  constructor(private readonly updateProfileUseCase: UpdateProfileUseCase) {
    super();
  }

  protected async handler(request: Controller.RequestPrivate<UpdatedProfileBody>): Promise<Controller.Response> {
    const accountId = request.accountId;
    const { birthDate, gender, height, name, weight } = request.body;

    await this.updateProfileUseCase.execute({
      accountId,
      birthDate,
      gender,
      height,
      name,
      weight,
    });

    return {
      statusCode: 204,
    };
  }
}
