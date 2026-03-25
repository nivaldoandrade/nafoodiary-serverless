/* eslint-disable no-console */

import { IEventHandler } from '@application/contracts/IEventHandler';
import { Constructor, Registry } from '@kernel/di/Registry';
import { S3Handler } from 'aws-lambda';

export function lambdaS3Adapter(eventHandlerImpl: Constructor<IEventHandler>): S3Handler {
  return async (event) => {
    const eventHandler = Registry.getInstance().resolver(eventHandlerImpl);

    const results = await Promise.allSettled(event.Records.map(
      e => eventHandler.handle({ fileKey: e.s3.object.key }),
    ));

    results.
      filter(result => result.status === 'rejected')
      .forEach(result => console.error(result.reason));
  };
}
