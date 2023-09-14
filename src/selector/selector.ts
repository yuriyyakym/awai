import { isReadableAsyncState } from '../lib';
import { type InferReadableType } from '../types';

import asyncSelector from './asyncSelector';
import syncSelector from './syncSelector';
import type { Config, Selector } from './types';

const selector = <T extends any[], U>(
  states: [...T],
  predicate: (...values: { [K in keyof T]: InferReadableType<T[K]> }) => U,
  customConfig?: Partial<Config<T, U>>,
): Selector<T, U> => {
  const isAsyncPredicate = predicate.constructor.name === 'AsyncFunction';

  const state =
    isAsyncPredicate || states.some((state) => isReadableAsyncState(state))
      ? asyncSelector(states, predicate, customConfig)
      : syncSelector(states, predicate, customConfig);

  return state as Selector<T, U>;
};

export default selector;
