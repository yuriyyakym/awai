import { AwaitableEvent, fork, getAggregatedAsyncStatus } from '../lib';
import { scenario } from '../scenario';
import {
  AsyncStatus,
  InferReadableType,
  ReadableAsyncState,
  ReadableState,
  Resolver,
  isReadableAsyncState,
} from '../types';

import { AsyncSelector } from './types';

const asyncSelector = <T extends (ReadableState<any> | ReadableAsyncState<any>)[], U>(
  states: T,
  predicate: (...values: { [K in keyof T]: InferReadableType<T[K]> }) => U,
): AsyncSelector<U> => {
  type StatesValues = { [K in keyof T]: InferReadableType<T[K]> };

  let error: AggregateError | undefined;
  let value: any;
  let isLoading: boolean = true;
  let nextVersion: number = -1;

  const events = {
    failed: new AwaitableEvent<unknown>(),
    changed: new AwaitableEvent<U>(),
    requested: new AwaitableEvent<void>(),
  };

  const getStatus = () => getAggregatedAsyncStatus(states);

  scenario(async () => {
    nextVersion++;

    const status = getStatus();
    const asyncStates = states.filter(isReadableAsyncState);
    const errors = asyncStates.map((state) => state.getAsync().error).filter(Boolean);

    if (errors.length > 0) {
      error = new AggregateError(errors);
      value = undefined;
      isLoading = status === AsyncStatus.LOADING;
      queueMicrotask(() => events.changed.emit(value));
      return;
    }

    if (status === AsyncStatus.LOADED) {
      const values = states.map((state) => state.get()) as StatesValues;

      fork(async () => {
        isLoading = true;
        let version = nextVersion;

        try {
          const newValue = await predicate(...values);
          if (version === nextVersion && newValue !== value) {
            error = undefined;
            value = newValue;
          }
        } catch (error) {
          if (version === nextVersion) {
            error = undefined;
            value = undefined;
          }
        } finally {
          if (version === nextVersion) {
            isLoading = false;
            queueMicrotask(() => events.changed.emit(value));
          }
        }
      });
    }

    await Promise.race(states.map((state) => state.events.changed));
  });

  const get = () => value;

  const getAsync = () => ({ error, isLoading, value });

  const getPromise = async (): Promise<U> => {
    const values = (await Promise.all(
      states.map((state) => (isReadableAsyncState(state) ? state.getPromise() : state.get())),
    )) as StatesValues;

    return await predicate(...values);
  };

  const then = async (resolve: Resolver<U>): Promise<U> => {
    const result = resolve(await getPromise());
    return result;
  };

  return {
    events,
    get,
    getAsync,
    getPromise,
    getStatus,
    then,
  };
};

export default asyncSelector;
