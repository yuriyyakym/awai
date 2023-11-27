import { isFunction } from '../../lib';
import type { Trigger } from '../types';

const getTriggerPromise = <T>(trigger: Trigger<T> | undefined) => {
  if (!trigger) {
    return Promise.resolve(undefined as T);
  }

  return isFunction(trigger) ? trigger() : trigger;
};

export default getTriggerPromise;
