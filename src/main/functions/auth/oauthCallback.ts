import 'reflect-metadata';

import { OAuthCallbackController } from '@application/controllers/auth/OAuthCallbackController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter(OAuthCallbackController);
