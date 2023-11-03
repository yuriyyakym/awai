import { type AwaiEvent } from '../core';

import Setter from './Setter';

export default interface WritableState<T> {
  events: {
    changed: AwaiEvent<T>;
  };
  then: PromiseLike<T>['then'];
  set: Setter<T>;
}
