
import { ISQSHandler } from '@application/contracts/ISQSHandler';
import { Constructor, Registry } from '@kernel/di/Registry';
import { SQSHandler } from 'aws-lambda';

export function lambdaSQSAdapter(eventHandlerImpl: Constructor<ISQSHandler>): SQSHandler {
  return async (event) => {
    const eventHandler = Registry.getInstance().resolver(eventHandlerImpl);

    await Promise.all(event.Records.map(e => {
      const body = JSON.parse(e.body);

      eventHandler.handle(body);
    }));

  };
}
