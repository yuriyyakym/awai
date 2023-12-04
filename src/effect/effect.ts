import { AsyncStatus, SystemTag } from '../constants';
import { AwaiEvent } from '../core';
import { registry } from '../global';
import { getAggregatedAsyncStatus, getUniqueId, isFunction } from '../lib';
import scenario from '../scenario';
import { type InferReadableType, type ReadableAsyncState, type ReadableState } from '../types';

import type { CleanupCallback, Config, Effect } from './types';

const getConfig = (customConfig: Partial<Config> = {}): Config => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(effect.name),
  tags: [SystemTag.EFFECT, ...(customConfig.tags ?? [])],
});

const effect = <
  T extends (ReadableState<any> | ReadableAsyncState<any>)[],
  V extends { [K in keyof T]: InferReadableType<T[K]> },
>(
  states: [...T],
  effect: (...values: V) => CleanupCallback | void,
  customConfig?: Partial<Config>,
): Effect<T, V> => {
  const config = getConfig(customConfig);

  let cleanup: ReturnType<typeof effect>;

  const events: Effect<T, V>['events'] = {
    cleared: new AwaiEvent(),
    started: new AwaiEvent(),
  };

  const runEffect = () => {
    const values = states.map((state) => state.get()) as V;
    const status = getAggregatedAsyncStatus(states);

    if (status !== AsyncStatus.FULFILLED) {
      return;
    }

    events.started.emit({ states, values });

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
      { tags: [SystemTag.CORE_NODE] },
    );

    queueMicrotask(runEffect);
  });

  const effectNode: Effect<T, V> = { config, events };

  registry.register(effectNode);

  return effectNode;
};

export default effect;
