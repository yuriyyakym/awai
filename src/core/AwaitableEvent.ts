import queue from '../global/queue';
import { type Resolver } from '../types';

type FilterPredicate<T> = (value: T) => boolean;

export default class AwaitableEvent<T> implements PromiseLike<T> {
  private _awaiters: Resolver<T>[] = [];

  then: PromiseLike<T>['then'] = (onfulfilled) => {
    if (onfulfilled) {
      this._awaiters.push(onfulfilled as any);
    }

    return new Promise((localResolve) => this._awaiters.push(localResolve as any));
  };

  emit(value: T) {
    queue.enqueue(async () => {
      const awaiters = [...this._awaiters];
      this._awaiters = [];
      for (const resolve of awaiters) {
        try {
          resolve(value);
        } catch {}
      }
    });
  }

  async filter(predicate: FilterPredicate<T>) {
    return new Promise(async (resolve) => {
      while (true) {
        const newValue = (await this) as T;
        const isApplicable = Boolean(predicate(newValue));

        if (isApplicable) {
          resolve(newValue);
          return;
        }
      }
    });
  }
}
