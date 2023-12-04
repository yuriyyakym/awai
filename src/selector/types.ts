import type { AwaiEvent } from '../core';
import type { BaseConfig, ReadableAsyncState, ReadableState } from '../types';

export type Version = number;

export type SyncConfig = BaseConfig;

export type AsyncConfig = BaseConfig;

export type VersionIgnoredEvent<T> = {
  error?: unknown;
  value?: T;
  version: Version;
};

export type SyncSelector<T> = ReadableState<T> & {
  config: SyncConfig;
};

export type AsyncSelector<T> = ReadableAsyncState<T> & {
  events: {
    ignored: AwaiEvent<VersionIgnoredEvent<T>>;
  };
  config: AsyncConfig;
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
  ? AsyncConfig
  : ContainsAsync<T> extends true
  ? AsyncConfig
  : SyncConfig;
