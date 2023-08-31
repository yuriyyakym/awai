import { AwaitableEvent, flush, isFunction, isPromiseLike } from '../lib';
import { AsyncStatus, Resolver } from '../types';

import type { AsyncState, InitialValue } from './types';

const isPromiseOrFunction = <T>(
  value: unknown,
): value is Promise<T> | ((...args: any) => Promise<T>) =>
  isFunction(value) || isPromiseLike<T>(value);

const asyncState = <T>(initialValue?: InitialValue<T>): AsyncState<T> => {
  const isInitialValueAsync = isPromiseOrFunction(initialValue);
  let version = 0;
  let status: AsyncStatus;
  let error: unknown = null;
  let isLoading = false;
  let value: T | undefined = isInitialValueAsync ? undefined : initialValue;

  if (isInitialValueAsync) {
    status = AsyncStatus.LOADING;
    const initialValuePromise = isFunction(initialValue) ? initialValue() : initialValue;
    Promise.resolve(initialValuePromise).then((resolvedValue) => {
      if (version === 0) {
        value = resolvedValue;
        version = 1;
        status = AsyncStatus.LOADED;
        events.changed.emit(resolvedValue);
      }
    });
  }

  const events: AsyncState<T>['events'] = {
    changed: new AwaitableEvent<T>(),
    failed: new AwaitableEvent<unknown>(),
    requested: new AwaitableEvent<void>(),
  };

  const getStatus: AsyncState<T>['getStatus'] = () => status;

  const set: AsyncState<T>['set'] = async (nextValueOrResolver) => {
    const nextVersion = ++version % Number.MAX_SAFE_INTEGER;

    try {
      if (isPromiseOrFunction(nextValueOrResolver)) {
        status = AsyncStatus.LOADING;
        events.requested.emit();
      }

      let newValue = isFunction(nextValueOrResolver)
        ? await nextValueOrResolver(value)
        : await nextValueOrResolver;

      if (version !== nextVersion) {
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

    await flush();
  };

  const get: AsyncState<T>['get'] = () => value;

  const getAsync: AsyncState<T>['getAsync'] = () => ({ error, isLoading, value });

  const getPromise: AsyncState<T>['getPromise'] = async () => {
    if (version > 0) {
      return value!;
    }

    return await events.changed;
  };

  const then = async (resolve: Resolver<T>): Promise<T> => {
    const result = resolve(await getPromise());
    return result;
  };

  return {
    events,
    get,
    getAsync,
    getPromise,
    getStatus,
    set,
    then,
  };
};

export default asyncState;
