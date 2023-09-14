import type { BaseConfig, ReadableAsyncState, WritableAsyncState } from '../types';

export type Config = BaseConfig;

export type InitialValue<T> = T | Promise<T> | (() => Promise<T>);

export type AsyncState<T> = ReadableAsyncState<T> &
  WritableAsyncState<T> & {
    config: Config;
  };
