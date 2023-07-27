import { AwaitableEvent } from '../lib';
import {
  AsyncStatus,
  InferReadableType,
  ReadableAsyncState,
  ReadableState,
  Resolver,
  isReadableAsyncState,
} from '../types';

import { getCommonStatus } from './lib';
import { AsyncSelector } from './types';

const asyncSelector = <T extends (ReadableState<any> | ReadableAsyncState<any>)[], U>(
  states: T,
  predicate: (...values: { [K in keyof T]: InferReadableType<T[K]> }) => U,
): AsyncSelector<U> => {
  type StatesValues = { [K in keyof T]: InferReadableType<T[K]> };

  let mounted = true;

  const events = {
    failed: new AwaitableEvent<unknown>(),
    changed: new AwaitableEvent<U>(),
    requested: new AwaitableEvent<void>(),
  };

  const getStatus = () => getCommonStatus(states);

  const get = () => {
    const status = getStatus();

    if (status !== AsyncStatus.LOADED) {
      return undefined;
    }

    const values = states.map((state) => state.get()) as StatesValues;

    return predicate(...values);
  };

  const getAsync = () => ({} as any); //({ error, isLoading, value });

  const getPromise = async (): Promise<U> => {
    const values = (await Promise.all(
      states.map((state) => (isReadableAsyncState(state) ? state.getPromise() : state.get())),
    )) as StatesValues;

    return predicate(...values);
  };

  const then = async (resolve: Resolver<U>): Promise<U> => {
    const result = resolve(await getPromise());
    return result;
  };

  const dispose = () => {
    // @todo Implement cleanup
    mounted = false;
  };

  (async () => {
    while (mounted) {
      /**
       * @todo Cleanup when disposed
       * @see https://github.com/yuriyyakym/awai/issues/1
       */
      await Promise.race(states.map((state) => state.events.changed));

      const status = getStatus();

      if (status === AsyncStatus.LOADING) {
        return;
      }

      queueMicrotask(() => {
        events.changed.emit(get()!);
      });
    }
  })();

  return {
    events,
    dispose,
    get,
    getAsync,
    getPromise,
    getStatus,
    then,
  };
};

export default asyncSelector;
