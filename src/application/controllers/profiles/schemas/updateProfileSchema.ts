import { Profile } from '@application/entities/Profile';
import * as z from 'zod/mini';

export const updateProfileSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(1)),
  gender: z.enum(Profile.Gender),
  height: z.number().check(z.positive()),
  weight: z.number().check(z.positive()),
  birthDate: z.pipe(
    z.string().check(z.iso.date()),
    z.transform(date => new Date(date)),
  ),
});

export type UpdatedProfileBody = z.infer<typeof updateProfileSchema>;
