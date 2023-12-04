import { AsyncStatus, SystemTag } from '../constants';
import { AwaiEvent, flush } from '../core';
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

import type { AsyncConfig, AsyncSelector, VersionIgnoredEvent } from './types';

const getConfig = (customConfig: Partial<AsyncConfig> = {}): AsyncConfig => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(asyncSelector.name),
  tags: [SystemTag.ASYNC_SELECTOR, ...(customConfig.tags ?? [])],
});

const asyncSelector = <T extends (ReadableState | ReadableAsyncState)[], U>(
  states: T,
  predicate: (...values: { [K in keyof T]: InferReadableType<T[K]> }) => U,
  customConfig?: Partial<AsyncConfig>,
): AsyncSelector<U> => {
  type StatesValues = { [K in keyof T]: InferReadableType<T[K]> };

  const config = getConfig(customConfig);
  const asyncStates = states.filter(isReadableAsyncState);

  let error: AggregateError | unknown | null = null;
  let value: U | undefined;
  let isLoading: boolean = true;
  let version = 0;
  let lastPendingVersion: number = version;

  const events: AsyncSelector<U>['events'] = {
    changed: new AwaiEvent<U | undefined>(),
    fulfilled: new AwaiEvent<U>(),
    ignored: new AwaiEvent<VersionIgnoredEvent<U>>(),
    rejected: new AwaiEvent<unknown>(),
    requested: new AwaiEvent<void>(),
  };

  const getStatus = () => getAggregatedAsyncStatus(states);

  const determineNextVersion = async () => {
    const currentPendingVersion = (lastPendingVersion + 1) % Number.MAX_SAFE_INTEGER;
    lastPendingVersion = currentPendingVersion;

    const status = getStatus();
    const errors = asyncStates.map((state) => state.getAsync().error).filter(Boolean);

    if (errors.length > 0) {
      error = new AggregateError(errors);
      value = undefined;
      isLoading = status === AsyncStatus.LOADING;
      version = lastPendingVersion;
      events.rejected.emit(error);
      events.changed.emit(value);
      return;
    }

    if (status === AsyncStatus.LOADED) {
      const values = states.map((state) => state.get()) as StatesValues;

      fork(async () => {
        isLoading = true;

        try {
          const newValue = await predicate(...values);

          if (currentPendingVersion !== lastPendingVersion) {
            events.ignored.emit({ value: newValue, version: currentPendingVersion });
            return;
          }

          if (newValue !== value) {
            error = null;
            value = newValue;
            events.fulfilled.emit(newValue);
            events.changed.emit(value);
          }
        } catch (caughtError) {
          if (currentPendingVersion !== lastPendingVersion) {
            events.ignored.emit({ error: caughtError, version: currentPendingVersion });
            return;
          }

          error = caughtError;
          value = undefined;
          events.rejected.emit(caughtError);
          events.changed.emit(value);
        } finally {
          if (currentPendingVersion === lastPendingVersion) {
            version = lastPendingVersion;
            isLoading = false;
          }
        }
      });
    }
  };

  scenario(
    async () => {
      const abortController = new AbortController();
      await Promise.race(states.map((state) => state.events.changed.abortable(abortController)));
      abortController.abort();
    },
    determineNextVersion,
    { tags: [SystemTag.CORE_NODE] },
  );

  scenario(
    async () => {
      const abortController = new AbortController();
      await Promise.race(
        asyncStates.map((state) => state.events.requested.abortable(abortController)),
      );
      abortController.abort();
    },
    async () => {
      events.requested.emit();
      await events.fulfilled;
    },
    { tags: [SystemTag.CORE_NODE], strategy: 'cyclic' },
  );

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

  determineNextVersion();

  registry.register(selectorNode);

  return selectorNode;
};

export default asyncSelector;
