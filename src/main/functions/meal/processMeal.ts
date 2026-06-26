import 'reflect-metadata';

import { MealQueueConsumer } from '@application/queues/MealQueueConsumer';
import { lambdaSQSAdapter } from '@main/adapters/lambdaSQSAdapter';

export const handler = lambdaSQSAdapter(MealQueueConsumer);
