import 'reflect-metadata';

import { CreateMealController } from '@application/controllers/meal/CreateMealController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter(CreateMealController);
