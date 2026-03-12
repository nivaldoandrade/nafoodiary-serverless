import * as z from 'zod/mini';

export const envSchema = z.object({
  COGNITO_CLIENT_ID: z.string().check(z.trim(), z.minLength(1)),
  COGNITO_USER_POOL_ID: z.string().check(z.trim(), z.minLength(1)),
  COGNITO_CLIENT_SECRET: z.string().check(z.trim(), z.minLength(1)),
  MAIN_TABLE_NAME: z.string().check(z.trim(), z.minLength(1)),
});

export const env = envSchema.parse(process.env);
