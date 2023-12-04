import { SystemTag } from '../constants';
import { AwaiEvent } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction } from '../lib';
import scenario from '../scenario';
import type { InferReadableType, ReadableAsyncState, ReadableState } from '../types';

import type { SyncConfig, SyncSelector } from './types';

const getConfig = (customConfig: Partial<SyncConfig> = {}): SyncConfig => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(syncSelector.name),
  tags: [SystemTag.SELECTOR, ...(customConfig.tags ?? [])],
});

const syncSelector = <T extends (ReadableState | ReadableAsyncState)[], U>(
  states: [...T],
  predicate: (...values: { [K in keyof T]: InferReadableType<T[K]> }) => U,
  customConfig?: Partial<SyncConfig>,
): SyncSelector<U> => {
  const config = getConfig(customConfig);

  const events = {
    changed: new AwaiEvent<U>(),
  };

  const get = () => {
    const values = states.map((state) => state.get()) as {
      [K in keyof T]: InferReadableType<T[K]>;
    };
    return predicate(...values);
  };

  const then: SyncSelector<U>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return undefined as any;
    }

    return resolve(get());
  };

  scenario(
    async () => {
      const abortController = new AbortController();
      await Promise.race(states.map((state) => state.events.changed.abortable(abortController)));
      abortController.abort();
    },
    () => events.changed.emit(get()),
    { tags: [SystemTag.CORE_NODE] },
  );

  const selectorNode: SyncSelector<U> = { config, events, get, then };

  registry.register(selectorNode);

  return selectorNode;
};

export default syncSelector;
