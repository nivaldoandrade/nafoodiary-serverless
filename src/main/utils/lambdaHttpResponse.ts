import { APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export function lambdaHttpResponse(
  statusCode: number,
  body?: Record<string, unknown>,
  headers?: APIGatewayProxyStructuredResultV2['headers'],
): APIGatewayProxyResultV2 {

  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
}
