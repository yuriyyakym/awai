import { AsyncStatus, SystemTag } from '../constants';
import { AwaiEvent, flush } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction, isPromiseOrFunction, noop } from '../lib';

import type { VersionIgnoredEvent, AsyncState, Config, InitialValue, Version } from './types';

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
  let version: Version = isInitialValueAsync ? 0 : 1;
  let lastPendingVersion: Version = version;
  let status: AsyncStatus = AsyncStatus.LOADED;
  let error: unknown = null;
  let value: T | undefined = isInitialValueAsync ? undefined : initialValue;

  const events: AsyncState<T>['events'] = {
    changed: new AwaiEvent<T | undefined>(),
    fulfilled: new AwaiEvent<T>(),
    ignored: new AwaiEvent<VersionIgnoredEvent<T>>(),
    rejected: new AwaiEvent<unknown>(),
    requested: new AwaiEvent<void>(),
  };

  const getStatus: AsyncState<T>['getStatus'] = () => status;

  const set: AsyncState<T>['set'] = async (nextValueOrResolver) => {
    const currentPendingVersion: Version = (lastPendingVersion + 1) % Number.MAX_SAFE_INTEGER;
    lastPendingVersion = currentPendingVersion;

    try {
      if (isPromiseOrFunction(nextValueOrResolver)) {
        status = AsyncStatus.LOADING;
        events.requested.emit();
      }

      let newValue = isFunction(nextValueOrResolver)
        ? await nextValueOrResolver(value)
        : await nextValueOrResolver;

      if (currentPendingVersion !== lastPendingVersion) {
        events.ignored.emit({ value: newValue, version: currentPendingVersion });
        return;
      }

      error = null;
      value = newValue;
      status = AsyncStatus.LOADED;

      events.fulfilled.emit(newValue);
      events.changed.emit(value);
    } catch (e) {
      if (currentPendingVersion !== lastPendingVersion) {
        events.ignored.emit({ error: e, version: currentPendingVersion });
        return;
      }

      error = e;
      value = undefined;
      status = AsyncStatus.FAILURE;

      events.rejected.emit(error);
      events.changed.emit(value);
    }

    version = lastPendingVersion;
    await flush();
  };

  const get: AsyncState<T>['get'] = () => value;

  const getAsync: AsyncState<T>['getAsync'] = () => ({
    error,
    isLoading: status === AsyncStatus.LOADING,
    value,
  });

  const getPromise: AsyncState<T>['getPromise'] = async () => {
    if (version === lastPendingVersion) {
      return value!;
    }

    const abortController = new AbortController();

    try {
      return await new Promise((resolve, reject) => {
        events.fulfilled.abortable(abortController).then(resolve).catch(noop);
        events.rejected.abortable(abortController).then(reject).catch(noop);
      });
    } finally {
      abortController.abort();
    }
  };

  const then: AsyncState<T>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      throw new Error('You have to pass callback argument when using `then` method');
    }

    return resolve(await getPromise());
  };

  if (isInitialValueAsync) {
    set(initialValue);
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
