import { Controller } from '@application/contracts/Controller';
import { HelloBody, helloSchema } from '@application/controllers/schemas/helloSchema';
import { HelloUseCase } from '@application/useCases/HelloUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(helloSchema)
export class HelloController extends Controller {

  constructor(private readonly helloUseCase: HelloUseCase) {
    super();
  }

  async handler(request: Controller.Request<HelloBody>): Promise<Controller.Response> {

    const result = await this.helloUseCase.execute({
      email: request.body.email,
    });

    return {
      statusCode: 200,
      body: result,
    };
  }

}
