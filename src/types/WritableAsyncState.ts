import { type AwaiEvent } from '../core';

import AsyncSetter from './AsyncSetter';

export default interface WritableAsyncState<T> {
  events: {
    changed: AwaiEvent<T | undefined>;
    fulfilled: AwaiEvent<T>;
    rejected: AwaiEvent<unknown>;
    requested: AwaiEvent<void>;
  };
  then: PromiseLike<T>['then'];
  set: AsyncSetter<T>;
}
