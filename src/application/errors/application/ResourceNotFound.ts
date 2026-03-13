import { ApplicationError } from '@application/errors/application/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';

export class ResourceNotFound extends ApplicationError {
  public statusCode = 404;
  public code: ErrorCode = 'RESOURCE_NOT_FOUND';

  constructor(message?: string) {
    super();
    this.name = ResourceNotFound.name;
    this.message = message ?? 'Resource not found.';
  }

}
