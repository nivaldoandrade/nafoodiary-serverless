import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { BadRequest } from '@application/errors/http/BadRequest';

export function lambdaHttpBodyParser(body: APIGatewayProxyEventV2['body']): Record<string, unknown> {
  try {
    if (!body) {
      return {};
    }

    return JSON.parse(body);
  } catch {
    throw new BadRequest('Malformed body.');
  }
}
