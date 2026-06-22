import { MealQueueConsumer } from '@application/queues/MealQueueConsumer';
import { lambdaSQSAdapter } from '@main/adapters/lambdaSQSAdapter';
import 'reflect-metadata';

export const handler = lambdaSQSAdapter(MealQueueConsumer);
