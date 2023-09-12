import { AwaitableEvent, flush } from '../core';
import { isFunction } from '../lib';
import { registry } from '../global';

import type { State } from './types';

const state = <T>(initialValue: T): State<T> => {
  let value = initialValue;

  const events = {
    changed: new AwaitableEvent<T>(),
  };

  const set: State<T>['set'] = async (nextValueOrResolver) => {
    let newValue = isFunction(nextValueOrResolver)
      ? nextValueOrResolver(value)
      : nextValueOrResolver;

    if (!Object.is(newValue, value)) {
      value = newValue;
      events.changed.emit(newValue);
    }

    await flush();

    return newValue;
  };

  const get = () => value;

  const then: State<T>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return undefined as any;
    }

    return resolve(value);
  };

  const stateNode = { events, get, set, then };

  registry.register(stateNode);

  return stateNode;
};

export default state;
