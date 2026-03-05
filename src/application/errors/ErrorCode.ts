export const ErrorCode = {
  VALIDATION: 'VALIDATION',
  EMAIL_ALREADY_IN_USE: 'EMAIL_ALREADY_IN_USE',

  // HTTP
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];
