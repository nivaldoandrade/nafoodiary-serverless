import 'reflect-metadata';

import { HelloController } from '@application/controllers/HelloController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter(HelloController);
