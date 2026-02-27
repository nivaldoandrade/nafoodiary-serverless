import { ErrorCode } from '@application/errors/ErrorCode';

export abstract class HttpError extends Error {
  public abstract statusCode: number;
  public abstract code: ErrorCode;
}
