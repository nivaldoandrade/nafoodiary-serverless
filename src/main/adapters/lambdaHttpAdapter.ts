import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { $ZodError } from 'zod/v4/core';

import { Controller } from '@application/contracts/Controller';
import { HttpError } from '@application/errors/http/HttpError';
import { Constructor, Registry } from '@kernel/di/Registry';
import { lambdaHttpBodyParser } from '@main/utils/lambdaHttpBodyParser';
import { lambdaHttpErrorResponse } from '@main/utils/lambdaHttpErrorResponse';
import { lambdaHttpResponse } from '@main/utils/lambdaHttpResponse';

export function lambdaHttpAdapter(controllerImpl: Constructor<Controller>) {
  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
      const body = lambdaHttpBodyParser(event.body);
      const params = event.pathParameters ?? {};
      const queryParams = event.queryStringParameters ?? {};

      const controller = Registry.getInstance().resolver(controllerImpl);

      const { statusCode, body: resultBody } = await controller.execute({
        body,
        params,
        queryParams,
      });

      return lambdaHttpResponse(statusCode, resultBody);

    } catch (error) {
      if (error instanceof $ZodError) {
        return lambdaHttpErrorResponse({
          statusCode: 400,
          code: 'VALIDATION',
          message: error.issues.map(error => ({
            field: error.path.join('.'),
            error: error.message,
          })),
        });
      }

      if (error instanceof HttpError) {
        return lambdaHttpErrorResponse(error);
      }

      console.log(error);

      return lambdaHttpErrorResponse({
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error.',
      });
    }
  };
}
