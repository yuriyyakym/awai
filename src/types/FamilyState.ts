import { AwaitableEvent } from '../lib';

import ReadableState from './ReadableState';

type FamilyState<T, Id extends string = string> = ReadableState<Record<Id, T>> & {
  events: {
    changed: AwaitableEvent<Record<Id, T>>;
  };
  getNode: (id: Id) => T;
};

export default FamilyState;
