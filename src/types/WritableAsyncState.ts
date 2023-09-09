import { type AwaitableEvent } from '../core';

import AsyncSetter from './AsyncSetter';

export default interface WritableAsyncState<T> {
  events: {
    changed: AwaitableEvent<T>;
    failed: AwaitableEvent<unknown>;
    requested: AwaitableEvent<void>;
  };
  then: PromiseLike<T>['then'];
  set: AsyncSetter<T>;
}
