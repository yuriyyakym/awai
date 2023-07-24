import { AwaitableEvent } from '../lib';
import { ReadableState } from '.';

type Key = string;

type FamilyState<T extends ReadableState<any> | ReadableState<any>> = ReadableState<
  Record<string, T>
> & {
  events: {
    set: AwaitableEvent<T>;
  };
  getNode: (id: Key) => T;
  set: (id: Key, value: T) => void;
};

export default FamilyState;
