import { AsyncStatus } from '../constants';
import { type AwaiEvent } from '../core';

import AsyncValue from './AsyncValue';

export default interface ReadableAsyncState<T = any> {
  events: {
    changed: AwaiEvent<T>;
    failed: AwaiEvent<unknown>;
    requested: AwaiEvent<void>;
  };
  get: () => T | undefined;
  getAsync: () => AsyncValue<T>;
  getPromise: () => Promise<T>;
  getStatus: () => AsyncStatus;
  then: PromiseLike<T>['then'];
}
