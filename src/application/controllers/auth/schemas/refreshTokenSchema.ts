import * as z from 'zod/mini';

export const refreshTokenSchema = z.object({
  refreshToken: z.string().check(z.trim(), z.minLength(1)),
});

export type RefreshTokenBody = z.infer<typeof refreshTokenSchema>;
