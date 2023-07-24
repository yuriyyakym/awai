import { AwaitableEvent } from '../lib';

import AsyncSetter from './AsyncSetter';
import Resolver from './Resolver';

export default interface WritableAsyncState<T> {
  events: {
    changed: AwaitableEvent<T>;
    failed: AwaitableEvent<unknown>;
    requested: AwaitableEvent<void>;
  };
  then: (resolver: Resolver<T>) => Promise<T>;
  set: AsyncSetter<T>;
}
