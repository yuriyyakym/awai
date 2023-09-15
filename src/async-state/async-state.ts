import { AsyncStatus, SystemTag } from '../constants';
import { AwaitableEvent, flush } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction, isPromiseOrFunction } from '../lib';

import type { AsyncState, Config, InitialValue } from './types';

const getConfig = (customConfig: Partial<Config> = {}): Config => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(asyncState.name),
  tags: [SystemTag.ASYNC_STATE, ...(customConfig.tags ?? [])],
});

const asyncState = <T>(
  initialValue?: InitialValue<T>,
  customConfig?: Partial<Config>,
): AsyncState<T> => {
  const config = getConfig(customConfig);
  const isInitialValueAsync = isPromiseOrFunction(initialValue);
  let version = 0;
  let status: AsyncStatus = AsyncStatus.LOADED;
  let error: unknown = null;
  let value: T | undefined = isInitialValueAsync ? undefined : initialValue;

  const events: AsyncState<T>['events'] = {
    changed: new AwaitableEvent<T>(),
    failed: new AwaitableEvent<unknown>(),
    requested: new AwaitableEvent<void>(),
  };

  const getStatus: AsyncState<T>['getStatus'] = () => status;

  const set: AsyncState<T>['set'] = async (nextValueOrResolver) => {
    const lastVersion = version;

    try {
      if (isPromiseOrFunction(nextValueOrResolver)) {
        status = AsyncStatus.LOADING;
        events.requested.emit();
      }

      let newValue = isFunction(nextValueOrResolver)
        ? await nextValueOrResolver(value)
        : await nextValueOrResolver;

      if (lastVersion !== version) {
        // Emit some abortion event?
        return;
      }

      value = newValue;
      status = AsyncStatus.LOADED;
      queueMicrotask(() => {
        events.changed.emit(newValue);
      });
    } catch (e) {
      status = AsyncStatus.FAILURE;
      error = e;
      events.failed.emit(error);
    }

    version = (version + 1) % Number.MAX_SAFE_INTEGER;
    await flush();
  };

  const get: AsyncState<T>['get'] = () => value;

  const getAsync: AsyncState<T>['getAsync'] = () => ({
    error,
    isLoading: status === AsyncStatus.LOADING,
    value,
  });

  const getPromise: AsyncState<T>['getPromise'] = async () => {
    if (version > 0) {
      return value!;
    }

    return await events.changed;
  };

  const then: AsyncState<T>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return undefined as any;
    }

    return resolve(await getPromise());
  };

  if (isInitialValueAsync) {
    const initialValuePromise = isFunction(initialValue) ? initialValue() : initialValue;
    set(initialValuePromise);
  }

  const asyncStateNode: AsyncState<T> = {
    config,
    events,
    get,
    getAsync,
    getPromise,
    getStatus,
    set,
    then,
  };

  registry.register(asyncStateNode);

  return asyncStateNode;
};

export default asyncState;
