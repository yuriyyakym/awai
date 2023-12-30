import { SystemTag } from '../constants';
import { AwaiEvent, flush } from '../core';
import { getUniqueId, isFunction } from '../lib';
import { registry } from '../global';

import type { Config, State } from './types';

const getConfig = (customConfig: Partial<Config> = {}): Config => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(state.name),
  tags: [SystemTag.STATE, ...(customConfig.tags ?? [])],
});

const state = <T>(initialValue: T, customConfig?: Partial<Config>): State<T> => {
  const config = getConfig(customConfig);

  let value = initialValue;

  const events = {
    changed: new AwaiEvent<T>(),
  };

  const set: State<T>['set'] = (nextValueOrResolver) => {
    let newValue = isFunction(nextValueOrResolver)
      ? nextValueOrResolver(value)
      : nextValueOrResolver;

    if (!Object.is(newValue, value)) {
      value = newValue;
      events.changed.emit(newValue);
    }

    return flush().then(() => newValue);
  };

  const get = () => value;

  const then: State<T>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return value as any;
    }

    return resolve(value);
  };

  const stateNode: State<T> = { config, events, get, set, then };

  registry.register(stateNode);

  return stateNode;
};

export default state;
