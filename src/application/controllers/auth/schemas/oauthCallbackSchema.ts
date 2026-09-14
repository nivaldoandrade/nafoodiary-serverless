import * as z from 'zod/mini';

export const oauthCallbackSchema = z.object({
  code: z.string().check(z.trim(), z.minLength(1)),
  redirectUri: z.string().check(z.trim(), z.minLength(1)),
  codeVerifier: z.string().check(z.trim(), z.minLength(1)),
});

export type OAuthCallbackBody = z.infer<typeof oauthCallbackSchema>;
