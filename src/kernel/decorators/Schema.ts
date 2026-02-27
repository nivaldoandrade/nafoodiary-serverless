import * as z from 'zod/mini';

const SCHEMA_METADATA_KEY = 'custom:schema';

export function Schema(schema: z.ZodMiniObject): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(SCHEMA_METADATA_KEY, schema, target);
  };
}

export function getSchema(target: object): z.ZodMiniObject | undefined {
  return Reflect.getMetadata(SCHEMA_METADATA_KEY, target.constructor);
}
