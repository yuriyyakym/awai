import { AwaitableEvent } from '../lib';
import { Resolver } from '../types';

type Setter<T> = (nextValueOrResolver: T | ((current: T) => T)) => Promise<T>;

export interface State<T> {
  events: {
    changed: AwaitableEvent<T>;
  };
  get: () => T;
  set: Setter<T>;
  then: (resolver: Resolver<T>) => void;
}
