
type Constructor<T = any> = new (...args: any[]) => T;

export class Registry {
  private providers = new Map<string, Registry.Provider>();

  register(impl: Constructor) {
    const token = impl.name;

    if (this.providers.has(token)) {
      throw new Error(`${token} already in registered.`);
    }

    const deps: Constructor[] = Reflect.getMetadata('design:paramtypes', impl) || [];

    this.providers.set(token, {
      impl,
      deps,
    });
  }

  resolver<T>(impl: Constructor<T>): T {
    const token = impl.name;
    const provider = this.providers.get(token);

    if (!provider) {
      throw new Error(`${token} is not registered.`);
    }

    const deps = provider.deps.map(dep => {
      return this.resolver(dep);
    });

    const instance = new provider.impl(...deps);

    return instance;
  }
}

namespace Registry {
  export type Provider = {
    impl: Constructor;
    deps: Constructor[];
  }
}
