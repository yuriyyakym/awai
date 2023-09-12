import { AwaitableEvent } from '../core';
import { registry } from '../global';
import { getAggregatedAsyncStatus, isFunction } from '../lib';
import scenario from '../scenario';
import {
  AsyncStatus,
  type InferReadableType,
  type ReadableAsyncState,
  type ReadableState,
} from '../types';

import type { CleanupCallback, Effect } from './types';

const effect = <
  T extends (ReadableState<any> | ReadableAsyncState<any>)[],
  V extends { [K in keyof T]: InferReadableType<T[K]> },
>(
  states: [...T],
  effect: (...values: V) => CleanupCallback | void,
): Effect<T, V> => {
  let cleanup: ReturnType<typeof effect>;

  const events: Effect<T, V>['events'] = {
    cleared: new AwaitableEvent(),
    run: new AwaitableEvent(),
  };

  const runEffect = () => {
    const values = states.map((state) => state.get()) as V;
    const status = getAggregatedAsyncStatus(states);

    if (status !== AsyncStatus.LOADED) {
      return;
    }

    events.run.emit({ states, values });

    cleanup = effect(...values);
  };

  queueMicrotask(() => {
    scenario(
      () => Promise.race(states.map((state) => state.events.changed)),
      () => {
        if (isFunction(cleanup)) {
          cleanup();
          events.cleared.emit({ states });
        }

        runEffect();
      },
    );

    queueMicrotask(runEffect);
  });

  const effectNode: Effect<T, V> = { events };

  registry.register(effectNode);

  return effectNode;
};

export default effect;
