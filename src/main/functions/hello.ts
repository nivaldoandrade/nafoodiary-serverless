import 'reflect-metadata';

import { HelloController } from '@application/controllers/HelloController';
import { HelloUseCase } from '@application/useCases/HelloUseCase';
import { Registry } from '@kernel/di/Registry';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

const registry = new Registry();

registry.register(HelloController);
registry.register(HelloUseCase);

const helloController = registry.resolver(HelloController);

// const helloController = new HelloController();

export const handler = lambdaHttpAdapter(helloController);
