import { ErrorCode } from '@application/errors/ErrorCode';
import { lambdaHttpResponse } from '@main/utils/lambdaHttpResponse';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

interface ILambdaHttpErrorResponse {
  headers?: APIGatewayProxyStructuredResultV2['headers'];
  statusCode: number;
  code: ErrorCode;
  message: any;
}

export function lambdaHttpErrorResponse({ headers, statusCode, code, message }: ILambdaHttpErrorResponse) {

  return lambdaHttpResponse(statusCode, {
    error: {
      code, message,
    },
  }, headers);
}
