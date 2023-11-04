import queue from '../global/queue';
import { isFunction } from '../lib';

type Resolver<T> = (value: T) => any;
type FilterPredicate<T> = (value: T) => boolean;

export default class AwaiEvent<T> {
  private _awaiters: Resolver<T>[] = [];

  then: PromiseLike<T>['then'] = (onfulfilled) => {
    return new Promise<any>((resolve) => {
      this._awaiters.push((value: T) => {
        const result = isFunction(onfulfilled) ? onfulfilled(value) : value;
        resolve(result);
      });
    });
  };

  getAbortablePromise(abortSignal: AbortSignal): PromiseLike<T> {
    return new Promise<T>((resolve, reject) => {
      this._awaiters.push(resolve);

      const abortionHandler = () => {
        this._awaiters.filter((awaiter) => awaiter !== resolve);
        reject('Aborted');

        abortSignal.removeEventListener('abort', abortionHandler);
      };

      abortSignal.addEventListener('abort', abortionHandler);
    });
  }

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
