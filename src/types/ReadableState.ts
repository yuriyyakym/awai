import { type AwaiEvent } from '../core';

export default interface ReadableState<T = any> extends PromiseLike<T> {
  events: {
    changed: AwaiEvent<T>;
  };
  get: () => T;
  then: PromiseLike<T>['then'];
}
