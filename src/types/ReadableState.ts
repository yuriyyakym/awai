import { AwaitableEvent } from '../lib';

import Resolver from './Resolver';

export default interface ReadableState<T> {
  events: {
    changed: AwaitableEvent<T>;
  };
  get: () => T;
  then: (resolver: Resolver<T>) => Promise<T>;
}
