import isPromiseLike from './isPromiseLike';
import isFunction from './isFunction';

const race = async <T extends readonly unknown[] | []>(promises: T, abortSignal?: AbortSignal) => {
  if (abortSignal?.aborted) {
    return Promise.reject(abortSignal.reason);
  }

  const internalAbortController = new AbortController();

  const abort = () => {
    internalAbortController.abort();
    abortSignal?.removeEventListener('abort', abort);
  };

  abortSignal?.addEventListener('abort', abort);

  const abortablePromises = promises.map((promise) => {
    return isAbortable(promise) ? promise.abortable(internalAbortController.signal) : promise;
  }) as Promise<T[number]>[];

  return await Promise.race(abortablePromises).finally(abort);
};

export default race;

type AbortablePromise<T> = Promise<T> & { abortable: (signal: AbortSignal) => Promise<T> };

const isAbortable = <T>(promise: unknown): promise is AbortablePromise<T> =>
  isPromiseLike<T>(promise) && 'abortable' in promise && isFunction(promise.abortable);
