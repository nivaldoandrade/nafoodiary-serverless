import 'reflect-metadata';

import { MealUploadedEventHandler } from '@application/events/MealUploadedEventHandler';
import { lambdaS3Adapter } from '@main/adapters/lambdaS3Adapter';

export const handler = lambdaS3Adapter(MealUploadedEventHandler);
