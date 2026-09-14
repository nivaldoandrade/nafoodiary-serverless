import 'reflect-metadata';

import { CompleteOnboardingController } from '@application/controllers/auth/CompleteOnboardingController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter(CompleteOnboardingController);
