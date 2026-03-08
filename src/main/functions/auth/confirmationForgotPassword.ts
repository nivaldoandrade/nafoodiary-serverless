import 'reflect-metadata';

import { ConfirmationForgotPasswordController } from '@application/controllers/auth/ConfirmationForgotPasswordController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter(ConfirmationForgotPasswordController);
