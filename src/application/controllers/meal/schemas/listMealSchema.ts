import * as z from 'zod/mini';

export const listMealQueryParamsSchema = z.object({
  date: z.pipe(
    z.string().check(z.iso.date()),
    z.transform(date => new Date(date)),
  ),
});

export type ListMealQueryParams = z.infer<
  typeof listMealQueryParamsSchema
>;
