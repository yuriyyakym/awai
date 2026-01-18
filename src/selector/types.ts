import type { AwaiEvent } from '../core';
import type {
  BaseConfig,
  Comparator,
  ReadableAsyncState,
  ReadableState,
} from '../types';

export type Version = number;

export type SyncConfig<T> = BaseConfig & Record<string, any> & {
  compare?: Comparator<T>;
};

export type AsyncConfig<T> = BaseConfig & Record<string, any> & {
  compare?: Comparator<T | undefined, T | undefined>;
};

export type VersionIgnoredEvent<T> = {
  error?: unknown;
  value?: T;
  version: Version;
};

export type SyncSelector<T> = ReadableState<T> & {
  config: SyncConfig<T>;
};

export type AsyncSelector<T> = ReadableAsyncState<T> & {
  config: AsyncConfig<T>;
  events: {
    ignored: AwaiEvent<VersionIgnoredEvent<T>>;
  };
};

export type ContainsAsync<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First extends ReadableAsyncState<any>
    ? true
    : ContainsAsync<Rest>
  : false;

export type Selector<T extends any[], U> = U extends PromiseLike<infer P>
  ? AsyncSelector<P>
  : ContainsAsync<T> extends true
    ? AsyncSelector<U>
    : SyncSelector<U>;

export type Config<T extends any[], U> = U extends PromiseLike<any>
  ? AsyncConfig<U>
  : ContainsAsync<T> extends true
    ? AsyncConfig<U>
    : SyncConfig<U>;
