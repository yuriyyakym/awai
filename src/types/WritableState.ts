import { type AwaitableEvent } from '../core';

import Setter from './Setter';

export default interface WritableState<T> {
  events: {
    changed: AwaitableEvent<T>;
  };
  then: PromiseLike<T>['then'];
  set: Setter<T>;
}
