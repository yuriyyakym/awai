import type { AwaiEvent } from '../core';
import type { BaseConfig, Id, ReadableState } from '../types';

export type Config = BaseConfig & Record<string, any>;

export type FamilyState<T> = ReadableState<Record<Id, T>> & {
  config: Config;
  events: {
    changed: AwaiEvent<Record<Id, T>>;
    stateCreated: AwaiEvent<Id>;
  };
  getNode: (id: Id) => T;
  setNode: (id: Id, stateNode: T) => void;
};
