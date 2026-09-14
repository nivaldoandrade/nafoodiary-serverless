import { ApplicationError } from '@application/errors/application/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';

export class InvalidOAuthGrant extends ApplicationError {
  public statusCode = 400;
  public code: ErrorCode = 'INVALID_GRANT';

  constructor(message?: string) {
    super();
    this.name = InvalidOAuthGrant.name;
    this.message = message ?? 'Invalid OAuth grant';
  }
}
