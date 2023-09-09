import { AwaitableEvent } from '../core';
import { registry } from '../global';
import { isFunction } from '../lib';
import { scenario } from '../scenario';
import { type InferReadableType } from '../types';

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

  const then: SyncSelector<U>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return undefined as any;
    }

    return resolve(get());
  };

  scenario(async () => {
    await Promise.race(states.map((state) => state.events.changed));
    events.changed.emit(get());
  });

  const selectorNode: SyncSelector<U> = { events, get, then };

  registry.register(selectorNode);

  return selectorNode;
};

export default syncSelector;
