import queue from '../global/queue';
import { isFunction } from '../lib';

type Resolver<T> = (value: T) => any;
type FilterPredicate<T> = (value: T) => boolean;

export default class AwaiEvent<T = void> {
  private _awaiters: Resolver<T>[] = [];

  then: PromiseLike<T>['then'] = (onfulfilled) => {
    return new Promise<any>((resolve, reject) => {
      this._awaiters.push((value: T) => {
        try {
          const result = isFunction(onfulfilled) ? onfulfilled(value) : value;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  abortable(abortSignal: AbortSignal): Promise<T> {
    if (abortSignal.aborted) {
      return Promise.reject(abortSignal.reason);
    }

    return new Promise<T>((resolve, reject) => {
      const resolveWithCleanup: Resolver<T> = (value: T) => {
        abortSignal.removeEventListener('abort', abortionHandler);
        resolve(value);
      };

      this._awaiters.push(resolveWithCleanup);

      const abortionHandler = () => {
        this._awaiters = this._awaiters.filter((awaiter) => awaiter !== resolveWithCleanup);
        reject(abortSignal.reason);
      };

      abortSignal.addEventListener('abort', abortionHandler, { once: true });
    });
  }

  emit(value: T) {
    queue.enqueue(async () => {
      const awaiters = this._awaiters;
      this._awaiters = [];

      for (const resolve of awaiters) {
        resolve(value);
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
