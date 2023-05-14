import { AwaitableEvent } from '../lib';
import { Resolver } from '../types';

import type { State } from './types';

const state = <T>(initialValue: T): State<T> => {
  let value = initialValue;

  const events = {
    changed: new AwaitableEvent<T>(),
  };

  const set = (newValue: T) => {
    value = newValue;
    events.changed.emit(newValue);
    return Promise.resolve(newValue);
  };

  const get = () => value;

  const then = (resolve: Resolver<T>) => {
    resolve(value);
  };

  return { events, get, set, then, value };
};

export default state;
