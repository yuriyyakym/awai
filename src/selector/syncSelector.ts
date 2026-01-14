import { SystemTag } from '../constants';
import { AwaiEvent } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction, race } from '../lib';
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
  let value: U;

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
      return get() as any;
    }

    return resolve(get());
  };

  scenario(
    () => race(states.map((state) => state.events.changed)),
    () => {
      const newValue = get();

      if (!Object.is(newValue, value)) {
        value = newValue;
        events.changed.emit(newValue);
      }
    },
    { tags: [SystemTag.CORE_NODE] },
  );

  value = get();

  const selectorNode: SyncSelector<U> = { config, events, get, then };

  registry.register(selectorNode);

  return selectorNode;
};

export default syncSelector;
