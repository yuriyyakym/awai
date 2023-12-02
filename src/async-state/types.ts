import type { AwaiEvent } from '../core';
import type { BaseConfig, ReadableAsyncState, WritableAsyncState } from '../types';

export type Version = number;

export type Config = BaseConfig;

export type InitialValue<T> = T | Promise<T> | (() => Promise<T>);

export type VersionIgnoredEvent<T> = {
  error?: unknown;
  value?: T;
  version: Version;
};

export type AsyncState<T> = ReadableAsyncState<T> &
  WritableAsyncState<T> & {
    config: Config;
  } & {
    events: {
      ignored: AwaiEvent<VersionIgnoredEvent<T>>;
    };
  };
