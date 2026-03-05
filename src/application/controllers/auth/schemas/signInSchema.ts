import * as z from 'zod/mini';

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().check(z.trim(), z.minLength(8)),
});

export type SignInBody = z.infer<typeof signInSchema>;
