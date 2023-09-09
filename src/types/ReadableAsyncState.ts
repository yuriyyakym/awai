import { type AwaitableEvent } from '../core';
import { isFunction, isObject } from '../lib';

import AsyncStatus from './AsyncStatus';
import AsyncValue from './AsyncValue';

export default interface ReadableAsyncState<T> {
  events: {
    changed: AwaitableEvent<T>;
    failed: AwaitableEvent<unknown>;
    requested: AwaitableEvent<void>;
  };
  get: () => T | undefined;
  getAsync: () => AsyncValue<T>;
  getPromise: () => Promise<T>;
  getStatus: () => AsyncStatus;
  then: PromiseLike<T>['then'];
}

export const isReadableAsyncState = <T>(value: unknown): value is ReadableAsyncState<T> =>
  isObject(value) &&
  isFunction(value.get) &&
  isFunction(value.getAsync) &&
  isFunction(value.getPromise) &&
  isFunction(value.then);
