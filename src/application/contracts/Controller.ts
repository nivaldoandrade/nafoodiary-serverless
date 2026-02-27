import { getSchema } from '@kernel/decorators/Schema';

export abstract class Controller {
  protected abstract handler(request: Controller.Request): Promise<Controller.Response>;

  public async execute(request: Controller.Request): Promise<Controller.Response> {
    const body = this.validateBody(request.body);

    return this.handler({ ...request, body });
  }

  private validateBody(body: Controller.Request['body']) {
    const schema = getSchema(this);

    if (!schema) {
      return body;
    }

    return schema.parse(body);
  }
}

export namespace Controller {
  export type Request<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>
  > = {
    body: TBody;
    params: TParams;
    queryParams: TQueryParams;
  };

  export type Response<TBody = Record<string, unknown>> = {
    statusCode: number;
    body?: TBody;
  };
}
