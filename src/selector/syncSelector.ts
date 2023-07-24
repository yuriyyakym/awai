import { AwaitableEvent } from '../lib';
import { InferStateType, Resolver } from '../types';

import { SyncSelector } from './types';

const syncSelector = <T extends any[], U>(
  states: [...T],
  predicate: (...values: { [K in keyof T]: InferStateType<T[K]> }) => U,
): SyncSelector<U> => {
  let mounted = true;

  const events = {
    changed: new AwaitableEvent<U>(),
  };

  const get = () => {
    const values = states.map((state) => state.get()) as { [K in keyof T]: T[K] };
    return predicate(...values);
  };

  const then = async (resolve: Resolver<U>): Promise<U> => {
    const result = resolve(get());
    return Promise.resolve(result);
  };

  const dispose = () => {
    mounted = false;
  };

  (async () => {
    while (mounted) {
      /**
       * @todo Cleanup when disposed
       * @see https://github.com/yuriyyakym/awai/issues/1
       */
      await Promise.race(states.map((state) => state.events.changed));
      events.changed.emit(get()!);
    }
  })();

  return { events, dispose, get, then };
};

export default syncSelector;
