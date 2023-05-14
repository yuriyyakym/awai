import { AwaitableEvent } from '../lib';
import { Resolver } from '../types';

export interface State<T> {
  events: {
    changed: AwaitableEvent<T>;
  };
  get: () => T;
  set: (value: T) => Promise<T>;
  then: (resolver: Resolver<T>) => void;
}
