import { ApplicationError } from '@application/errors/application/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';

export class EmailAlreadyInUse extends ApplicationError {
  public statusCode = 409;
  public code: ErrorCode = 'EMAIL_ALREADY_IN_USE';

  constructor(message?: string) {
    super();
    this.name = EmailAlreadyInUse.name;
    this.message = message ?? 'This email is already in use.';
  }

}
