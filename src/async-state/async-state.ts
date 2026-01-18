import { AsyncStatus, SystemTag } from '../constants';
import { AwaiEvent, flush } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction, isPromiseOrFunction, race } from '../lib';

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
  const compare = config.compare ?? Object.is;
  const isInitialValueAsync = isPromiseOrFunction(initialValue);
  let version: Version = isInitialValueAsync ? 0 : 1;
  let lastPendingVersion: Version = version;
  let status: AsyncStatus = AsyncStatus.FULFILLED;
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
        status = AsyncStatus.PENDING;
        events.requested.emit();
      }

      let newValue = isFunction(nextValueOrResolver)
        ? await nextValueOrResolver(value)
        : await nextValueOrResolver;
      const isChanged = typeof value === 'undefined' || !compare(newValue, value);

      if (currentPendingVersion !== lastPendingVersion || !isChanged) {
        events.ignored.emit({ value: newValue, version: currentPendingVersion });
        return;
      }

      error = null;
      value = newValue;
      status = AsyncStatus.FULFILLED;

      events.fulfilled.emit(newValue);

      if (isChanged) {
        events.changed.emit(value);
      }
    } catch (e) {
      if (currentPendingVersion !== lastPendingVersion) {
        events.ignored.emit({ error: e, version: currentPendingVersion });
        return;
      }

      const isChanged = typeof value !== 'undefined';

      error = e;
      value = undefined;
      status = AsyncStatus.REJECTED;

      events.rejected.emit(error);

      if (isChanged) {
        events.changed.emit(value);
      }
    }

    version = lastPendingVersion;
    await flush();
  };

  const get: AsyncState<T>['get'] = () => value;

  const getAsync: AsyncState<T>['getAsync'] = () => ({
    error,
    isLoading: status === AsyncStatus.PENDING,
    value,
  });

  const getPromise: AsyncState<T>['getPromise'] = async () => {
    if (version === lastPendingVersion) {
      return value!;
    }

    await race([events.fulfilled, events.rejected]);

    if (error) {
      throw error;
    }

    return value!;
  };

  const then: PromiseLike<T>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return getPromise() as any;
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
