import { ErrorCode } from '@application/errors/ErrorCode';

export abstract class ApplicationError extends Error {
  public abstract statusCode?: number;
  public abstract code: ErrorCode;

}
