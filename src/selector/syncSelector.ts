import { AwaitableEvent } from '../lib';
import { scenario } from '../scenario';
import { InferReadableType, Resolver } from '../types';

import { SyncSelector } from './types';

const syncSelector = <T extends any[], U>(
  states: [...T],
  predicate: (...values: { [K in keyof T]: InferReadableType<T[K]> }) => U,
): SyncSelector<U> => {
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

  scenario(async () => {
    await Promise.race(states.map((state) => state.events.changed));
    events.changed.emit(get()!);
  });

  return { events, get, then };
};

export default syncSelector;
