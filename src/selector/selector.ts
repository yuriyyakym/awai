import { isReadableAsyncState } from '../lib';
import { type InferReadableType, type ReadableAsyncState } from '../types';

import asyncSelector from './asyncSelector';
import syncSelector from './syncSelector';
import type { AsyncSelector, SyncSelector } from './types';

type ContainsAsync<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First extends ReadableAsyncState<any>
    ? true
    : ContainsAsync<Rest>
  : false;

type Return<T extends any[], U> = U extends PromiseLike<infer P>
  ? AsyncSelector<P>
  : ContainsAsync<T> extends true
  ? AsyncSelector<U>
  : SyncSelector<U>;

const selector = <T extends any[], U>(
  states: [...T],
  predicate: (...values: { [K in keyof T]: InferReadableType<T[K]> }) => U,
): Return<T, U> => {
  const isAsyncPredicate = predicate.constructor.name === 'AsyncFunction';

  const state =
    isAsyncPredicate || states.some((state) => isReadableAsyncState(state))
      ? asyncSelector(states, predicate)
      : syncSelector(states, predicate);

  return state as Return<T, U>;
};

export default selector;
