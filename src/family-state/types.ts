import type { AwaitableEvent } from '../core';
import type { BaseConfig, Id, ReadableState } from '../types';

export type Config = BaseConfig;

export type FamilyState<T> = ReadableState<Record<Id, T>> & {
  config: Config;
  events: {
    changed: AwaitableEvent<Record<Id, T>>;
    stateCreated: AwaitableEvent<Id>;
  };
  getNode: (id: Id) => T;
  setNode: (id: Id, stateNode: T) => void;
};
