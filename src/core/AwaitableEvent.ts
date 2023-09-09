import queue from '../global/queue';
import { isFunction } from '../lib';

type Resolver<T> = (value: T) => any;
type FilterPredicate<T> = (value: T) => boolean;

export default class AwaitableEvent<T> implements PromiseLike<T> {
  private _awaiters: Resolver<T>[] = [];

  then: PromiseLike<T>['then'] = (onfulfilled) => {
    if (!isFunction(onfulfilled)) {
      return Promise.resolve<any>(undefined);
    }

    return new Promise<ReturnType<typeof onfulfilled>>((localResolve) => {
      this._awaiters.push((value: T) => {
        const result = onfulfilled(value);
        localResolve(result);
      });
    });
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
