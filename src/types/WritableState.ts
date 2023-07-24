import { AwaitableEvent } from '../lib';
import { Setter } from '../state';
import Resolver from './Resolver';

export default interface WritableState<T> {
  events: {
    changed: AwaitableEvent<T>;
  };
  then: (resolver: Resolver<T>) => Promise<T>;
  set: Setter<T>;
}
