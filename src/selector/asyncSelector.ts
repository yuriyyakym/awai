import { AsyncStatus, SystemTag } from '../constants';
import { AwaiEvent } from '../core';
import { registry } from '../global';
import {
  fork,
  getAggregatedAsyncStatus,
  getUniqueId,
  isFunction,
  isReadableAsyncState,
  race,
} from '../lib';
import scenario from '../scenario';
import type { InferReadableType, ReadableAsyncState, ReadableState } from '../types';

import type { AsyncConfig, AsyncSelector, VersionIgnoredEvent } from './types';

const getConfig = <U>(customConfig: Partial<AsyncConfig<U>> = {}): AsyncConfig<U> => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(asyncSelector.name),
  tags: [SystemTag.ASYNC_SELECTOR, ...(customConfig.tags ?? [])],
});

const asyncSelector = <T extends (ReadableState | ReadableAsyncState)[], U>(
  states: T,
  predicate: (...values: { [K in keyof T]: InferReadableType<T[K]> }) => U,
  customConfig?: Partial<AsyncConfig<U>>,
): AsyncSelector<U> => {
  type StatesValues = { [K in keyof T]: InferReadableType<T[K]> };

  const config = getConfig(customConfig);
  const compare = config.compare ?? Object.is;
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

  const getStatus = () => {
    if (isLoading) {
      return AsyncStatus.PENDING;
    }

    const aggregatedStatus = getAggregatedAsyncStatus(asyncStates);

    return error !== null && aggregatedStatus === AsyncStatus.FULFILLED
      ? AsyncStatus.REJECTED
      : aggregatedStatus;
  };

  const processStateChange = async () => {
    const currentPendingVersion = (lastPendingVersion + 1) % Number.MAX_SAFE_INTEGER;
    lastPendingVersion = currentPendingVersion;

    const status = getAggregatedAsyncStatus(asyncStates);
    const errors = asyncStates.map((state) => state.getAsync().error).filter(Boolean);

    if (status === AsyncStatus.PENDING) {
      isLoading = true;
    }

    events.requested.emit();

    if (errors.length > 0) {
      error = new AggregateError(errors);
      value = undefined;
      isLoading = status === AsyncStatus.PENDING;
      version = lastPendingVersion;
      events.rejected.emit(error);
      events.changed.emit(value);
      return;
    }

    if (status === AsyncStatus.FULFILLED) {
      const values = states.map((state) => state.get()) as StatesValues;

      fork(async () => {
        isLoading = true;

        try {
          const newValue = await predicate(...values);
          const isChanged = !compare(newValue, value);

          if (currentPendingVersion !== lastPendingVersion) {
            events.ignored.emit({ value: newValue, version: currentPendingVersion });
            return;
          }

          error = null;
          value = newValue;

          events.fulfilled.emit(newValue);

          if (isChanged) {
            events.changed.emit(value);
          }
        } catch (caughtError) {
          if (currentPendingVersion !== lastPendingVersion) {
            events.ignored.emit({ error: caughtError, version: currentPendingVersion });
            return;
          }

          const isChanged = typeof value !== 'undefined';

          error = caughtError;
          value = undefined;

          events.rejected.emit(caughtError);

          if (isChanged) {
            events.changed.emit(value);
          }
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
      const abortSignal = abortController.signal;
      await Promise.race(
        states.map((state) => {
          return isReadableAsyncState(state)
            ? race(
              [state.events.requested, state.events.rejected, state.events.fulfilled],
              abortSignal,
            )
            : state.events.changed.abortable(abortSignal);
        }),
      );
      abortController.abort();
    },
    processStateChange,
    { tags: [SystemTag.CORE_NODE] },
  );

  const get = () => value;

  const getAsync = () => ({ error, isLoading, value });

  const getPromise = async (): Promise<U> => {
    while (isLoading) {
      await race([events.fulfilled, events.rejected]);
    }

    if (error) {
      throw error;
    }

    return value!;
  };

  const then: AsyncSelector<U>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return getPromise() as any;
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

  queueMicrotask(processStateChange);

  registry.register(selectorNode);

  return selectorNode;
};

export default asyncSelector;
