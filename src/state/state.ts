import { AwaitableEvent, isFunction } from '../lib';
import { Resolver } from '../types';
import { isFunction } from '../lib';

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

  const then: State<T>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return undefined as any;
    }

    return resolve(value);
  };

  return {
    events,
    get,
    set,
    then,
  };
};

export default state;
