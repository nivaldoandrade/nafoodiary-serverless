import { ApplicationError } from '@application/errors/application/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';

export class InvalidCredentials extends ApplicationError {
  public statusCode = 401;
  public code: ErrorCode = 'INVALID_CREDENTIALS';

  constructor(message?: string) {
    super();
    this.name = InvalidCredentials.name;
    this.message = message ?? 'Invalid credentials';
  }

}
