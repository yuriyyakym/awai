import { type AwaitableEvent } from '../core';

export default interface ReadableState<T = any> extends PromiseLike<T> {
  events: {
    changed: AwaitableEvent<T>;
  };
  get: () => T;
  then: PromiseLike<T>['then'];
}
