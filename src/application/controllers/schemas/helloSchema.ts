import * as z from 'zod/v4-mini';

export const helloSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(1)),
  email: z.email(),
});

export type HelloBody = z.infer<typeof helloSchema>;
