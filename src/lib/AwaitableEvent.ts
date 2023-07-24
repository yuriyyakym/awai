import { Resolver } from '../types';

type FilterPredicate<T> = (value: T) => boolean;

// implements PromiseLike<T>
export default class AwaitableEvent<T> {
  private _awaiters: Resolver<T>[] = [];

  async then(resolve: Resolver<T>): Promise<T> {
    this._awaiters.push(resolve);
    return new Promise<T>((localResolve) => this._awaiters.push(localResolve));
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
