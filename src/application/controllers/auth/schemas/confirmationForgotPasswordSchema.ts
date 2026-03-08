import * as z from 'zod/mini';

export const confirmationForgotPasswordSchema = z.object({
  email: z.email(),
  password: z.string().check(z.trim(), z.minLength(8)),
  confirmationCode: z.string().check(z.trim(), z.minLength(6)),
});

export type ConfirmationForgotPasswordBody = z.infer<typeof confirmationForgotPasswordSchema>;
