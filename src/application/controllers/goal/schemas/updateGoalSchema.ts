
import * as z from 'zod/mini';

export const updateGoalSchema = z.object({
  calories: z.number().check(z.positive()),
  proteins: z.number().check(z.positive()),
  carbohydrates: z.number().check(z.positive()),
  fats: z.number().check(z.positive()),
});

export type UpdateGoalSchema = z.infer<typeof updateGoalSchema>;
