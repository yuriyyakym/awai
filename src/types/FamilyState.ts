import { AwaitableEvent } from '../lib';

import ReadableState from './ReadableState';

type FamilyState<
  T,
  Family extends Record<Id, T>,
  Id extends string = string,
> = ReadableState<Family> & {
  events: {
    changed: AwaitableEvent<Family>;
  };
  getNode: (id: Id) => T;
};

export default FamilyState;
