import { APIGatewayProxyEventV2, APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { $ZodError } from 'zod/v4/core';

import { Controller } from '@application/contracts/Controller';
import { ApplicationError } from '@application/errors/application/ApplicationError';
import { HttpError } from '@application/errors/http/HttpError';
import { Constructor, Registry } from '@kernel/di/Registry';
import { lambdaHttpBodyParser } from '@main/utils/lambdaHttpBodyParser';
import { lambdaHttpErrorResponse } from '@main/utils/lambdaHttpErrorResponse';
import { lambdaHttpResponse } from '@main/utils/lambdaHttpResponse';

type Event = APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer

export function lambdaHttpAdapter(controllerImpl: Constructor<Controller<'private' | 'public'>>) {
  return async (event: Event): Promise<APIGatewayProxyResultV2> => {
    try {
      const body = lambdaHttpBodyParser(event.body);
      const params = event.pathParameters ?? {};
      const queryParams = event.queryStringParameters ?? {};

      const accountId = 'authorizer' in event.requestContext
        ? event.requestContext.authorizer.jwt.claims['internalId'] as string
        : undefined;

      const controller = Registry.getInstance().resolver(controllerImpl);

      const request = accountId
        ? { body, params, queryParams, accountId }
        : { body, params, queryParams };

      const {
        statusCode,
        body: resultBody,
      } = await controller.execute(request);

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

      if (error instanceof ApplicationError) {
        return lambdaHttpErrorResponse({
          statusCode: error.statusCode ?? 400,
          code: error.code,
          message: error.message,
        });
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
