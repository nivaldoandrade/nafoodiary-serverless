import 'reflect-metadata';

import { GetMealByIdController } from '@application/controllers/meal/GetMealByIdController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter(GetMealByIdController);
