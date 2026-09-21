import { ErrorCode } from '@application/errors/ErrorCode';
import { HttpError } from '@application/errors/http/HttpError';

export class RateLimitExceeded extends HttpError {
  public readonly statusCode = 429;
  public readonly code: ErrorCode = 'RATE_LIMIT_EXCEEDED';

  constructor(
    message?: any,
  ) {
    super();
    this.name = RateLimitExceeded.name;
    this.code = 'RATE_LIMIT_EXCEEDED';
    this.message = message ?? 'Too many requests. Try again later';
  }
}
