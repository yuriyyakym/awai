import type { BaseConfig, ReadableState, WritableState } from '../types';

export type Config = BaseConfig & Record<string, any>;

export type State<T> = ReadableState<T> &
  WritableState<T> & {
    config: Config;
  };
