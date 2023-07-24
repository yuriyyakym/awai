import { AwaitableEvent } from '../lib';

import ReadableAsyncState from './ReadableAsyncState';
import ReadableState from './ReadableState';

type Key = string;

type FamilyState<T extends ReadableState<any> | ReadableAsyncState<any>> = ReadableState<
  Record<string, T>
> & {
  events: {
    set: AwaitableEvent<T>;
  };
  getNode: (id: Key) => T;
  set: (id: Key, value: T) => void;
};

export default FamilyState;
