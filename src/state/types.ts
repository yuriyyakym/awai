import type { BaseConfig, Comparator, ReadableState, WritableState } from '../types';

export type Config<T> = BaseConfig & Record<string, any> & {
  compare?: Comparator<T>;
};

export type State<T> = ReadableState<T> & WritableState<T> & {
  config: Config<T>;
};
