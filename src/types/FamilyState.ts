import { AwaitableEvent } from '../lib';

import ReadableState from './ReadableState';

type Id = string;

type FamilyState<T> = ReadableState<Record<Id, T>> & {
  events: {
    changed: AwaitableEvent<Record<Id, T>>;
    stateCreated: AwaitableEvent<Id>;
  };
  getNode: (id: Id) => T;
  setNode: (id: Id, stateNode: T) => void;
};

export default FamilyState;
