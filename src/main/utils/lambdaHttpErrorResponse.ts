import { ErrorCode } from '@application/errors/ErrorCode';
import { lambdaHttpResponse } from '@main/utils/lambdaHttpResponse';

interface ILambdaHttpErrorResponse {
  statusCode: number;
  code: ErrorCode;
  message: any;
}

export function lambdaHttpErrorResponse({ statusCode, code, message }: ILambdaHttpErrorResponse) {

  return lambdaHttpResponse(statusCode, {
    error: {
      code,
      message,
    },
  });
}
