import { Resolver } from '../types';

type FilterPredicate<T> = (value: T) => boolean;

export default class AwaitableEvent<T> {
  private _awaiters: Resolver<T>[] = [];

  then(resolve: Resolver<T>) {
    this._awaiters.push(resolve);
  }

  emit(value: T) {
    const awaiters = [...this._awaiters];
    this._awaiters = [];
    (async () => {
      for (const resolve of awaiters) {
        try {
          await resolve(value);
        } catch {}
      }
    })();
  }

  async filter(predicate: FilterPredicate<T>) {
    return new Promise(async (resolve) => {
      while (true) {
        const newValue = await this;
        const isApplicable = Boolean(predicate(newValue));

        if (isApplicable) {
          resolve(newValue);
          return;
        }
      }
    });
  }
}
