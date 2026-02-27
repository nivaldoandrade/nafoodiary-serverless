import { ErrorCode } from '@application/errors/ErrorCode';
import { HttpError } from '@application/errors/http/HttpError';

export class BadRequest extends HttpError {
  public readonly statusCode = 400;
  public readonly code: ErrorCode;

  constructor(
    message?: any,
    code: ErrorCode = 'BAD_REQUEST',
  ) {
    super();
    this.name = BadRequest.name;
    this.code = code;
    this.message = message ?? 'Bad Request';
  }
}
