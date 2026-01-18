import type { AwaiEvent } from '../core';
import type {
  BaseConfig,
  Comparator,
  ReadableAsyncState,
  WritableAsyncState,
} from '../types';

export type Version = number;

export type Config<T> = BaseConfig & Record<string, any> & {
  compare?: Comparator<T | undefined, T | undefined>;
};

export type InitialValue<T> = T | Promise<T> | (() => Promise<T>);

export type VersionIgnoredEvent<T> = {
  error?: unknown;
  value?: T;
  version: Version;
};

export type AsyncState<T> = ReadableAsyncState<T> & WritableAsyncState<T> & {
  config: Config<T>;
  events: {
    ignored: AwaiEvent<VersionIgnoredEvent<T>>;
  };
};
