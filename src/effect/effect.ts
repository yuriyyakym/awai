import { getAggregatedAsyncStatus, isFunction } from '../lib';
import { scenario } from '../scenario';
import { AsyncStatus, InferReadableType } from '../types';

import { CleanupCallback } from './types';

const effect = <T extends any[], V extends { [K in keyof T]: InferReadableType<T[K]> }>(
  states: [...T],
  effect: (...values: V) => CleanupCallback | void,
) => {
  let cleanup: ReturnType<typeof effect>;

  const runEffect = () => {
    const values = states.map((state) => state.get()) as V;
    const status = getAggregatedAsyncStatus(states);

    if (status !== AsyncStatus.LOADED) {
      return;
    }

    return effect(...values);
  };

  cleanup = runEffect();

  scenario(async () => {
    await Promise.race(states.map((state) => state.events.changed));

    if (isFunction(cleanup)) {
      cleanup();
    }

    cleanup = runEffect();
  });
};

export default effect;
