import { AwaiEvent } from '../core';

const race = async <T extends readonly unknown[] | []>(
  promises: T,
  abortSignal?: AbortSignal,
): Promise<Awaited<T[number]>> => {
  const internalAbortController = new AbortController();

  const abort = () => {
    internalAbortController.abort();
    abortSignal?.removeEventListener('abort', abort);
  };

  abortSignal?.addEventListener('abort', abort);

  const abortablePromises = promises.map((promise) => {
    return promise instanceof AwaiEvent
      ? promise.abortable(internalAbortController.signal)
      : promise;
  }) as Promise<T[number]>[];

  return await Promise.race(abortablePromises).finally(abort);
};

export default race;
