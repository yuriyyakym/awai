import { AsyncStatus, SystemTag } from '../constants';
import { AwaitableEvent } from '../core';
import { registry } from '../global';
import {
  fork,
  getAggregatedAsyncStatus,
  getUniqueId,
  isFunction,
  isReadableAsyncState,
} from '../lib';
import scenario from '../scenario';
import type { InferReadableType, ReadableAsyncState, ReadableState } from '../types';

import type { AsyncConfig, AsyncSelector } from './types';

const getConfig = (customConfig: Partial<AsyncConfig> = {}): AsyncConfig => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(asyncSelector.name),
  tags: [SystemTag.ASYNC_SELECTOR, ...(customConfig.tags ?? [])],
});

const asyncSelector = <T extends (ReadableState<any> | ReadableAsyncState<any>)[], U>(
  states: T,
  predicate: (...values: { [K in keyof T]: InferReadableType<T[K]> }) => U,
  customConfig?: Partial<AsyncConfig>,
): AsyncSelector<U> => {
  type StatesValues = { [K in keyof T]: InferReadableType<T[K]> };

  const config = getConfig(customConfig);

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

  const then: AsyncSelector<U>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return undefined as any;
    }

    return resolve(await getPromise());
  };

  const selectorNode = {
    config,
    events,
    get,
    getAsync,
    getPromise,
    getStatus,
    then,
  };

  registry.register(selectorNode);

  return selectorNode;
};

export default asyncSelector;
