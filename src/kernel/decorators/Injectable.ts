import { Constructor, Registry } from '@kernel/di/Registry';

export function Injectable(): ClassDecorator {
  return (target) => {
    Registry.getInstance().register(target as unknown as Constructor);
  };
}
