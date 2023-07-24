import { AwaitableEvent, isFunction } from '../lib';
import { Resolver } from '../types';

import type { State } from './types';

const state = <T>(initialValue: T): State<T> => {
  let value = initialValue;

  const events = {
    changed: new AwaitableEvent<T>(),
  };

  const set: State<T>['set'] = (nextValueOrResolver) => {
    let newValue = isFunction(nextValueOrResolver)
      ? nextValueOrResolver(value)
      : nextValueOrResolver;

    if (!Object.is(newValue, value)) {
      value = newValue;
      events.changed.emit(newValue);
    }

    return new Promise((resolve) => queueMicrotask(() => resolve(newValue)));
  };

  const get = () => value;

  const then = async (resolve: Resolver<T>): Promise<T> => {
    const result = resolve(value);
    return Promise.resolve(result);
  };

  return {
    events,
    get,
    set,
    then,
  };
};

export default state;
