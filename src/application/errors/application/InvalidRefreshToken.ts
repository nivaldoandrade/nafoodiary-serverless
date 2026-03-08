import { ApplicationError } from '@application/errors/application/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';

export class InvalidRefreshToken extends ApplicationError {
  public statusCode? = 401;
  public code: ErrorCode = 'INVALID_REFRESH_TOKEN';

  constructor(message?: string) {
    super();
    this.name = InvalidRefreshToken.name;
    this.message = message ?? 'Invalid Refresh Token.';
  }

}
