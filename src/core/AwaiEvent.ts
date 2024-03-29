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

  abortable(abortController: AbortController): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this._awaiters.push(resolve);

      const abortionHandler = () => {
        this._awaiters = this._awaiters.filter((awaiter) => awaiter !== resolve);
        reject('Aborted');

        abortController.signal.removeEventListener('abort', abortionHandler);
      };

      abortController.signal.addEventListener('abort', abortionHandler);
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
