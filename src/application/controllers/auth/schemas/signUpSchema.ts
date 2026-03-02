import * as z from 'zod/mini';

export const signUpSchema = z.object({
  account: z.object({
    email: z.email(),
    password: z.string().check(z.trim(), z.minLength(8)),
  }),
});

export type SignUpBody = z.infer<typeof signUpSchema>;
