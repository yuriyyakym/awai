import { AwaiEvent } from '../core';
import noop from './noop';

const race = async <T extends readonly unknown[] | []>(
  promises: T,
  abortController?: AbortController,
): Promise<Awaited<T[number]>> => {
  const internalAbortController = new AbortController();

  const abort = () => {
    internalAbortController.abort();
    abortController?.signal.removeEventListener('abort', abort);
  };

  abortController?.signal.addEventListener('abort', abort);

  return await Promise.race(
    promises.map((promise) =>
      promise instanceof AwaiEvent ? promise.abortable(internalAbortController) : promise,
    ) as Promise<T>[],
  ).finally(abort);
};

export default race;
