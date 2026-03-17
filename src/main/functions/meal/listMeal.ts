import 'reflect-metadata';

import { ListMealsController } from '@application/controllers/meal/ListMealsController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter(ListMealsController);
