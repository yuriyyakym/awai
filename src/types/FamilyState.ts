import { type AwaitableEvent } from '../core';

import Id from './Id';
import ReadableState from './ReadableState';

type FamilyState<T> = ReadableState<Record<Id, T>> & {
  events: {
    changed: AwaitableEvent<Record<Id, T>>;
    stateCreated: AwaitableEvent<Id>;
  };
  getNode: (id: Id) => T;
  setNode: (id: Id, stateNode: T) => void;
};

export default FamilyState;
