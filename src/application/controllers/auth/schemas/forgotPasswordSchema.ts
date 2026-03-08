import { z } from 'zod/mini';

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
