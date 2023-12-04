import { type AwaiEvent } from '../core';
import type { BaseConfig, InferReadableType, ReadableAsyncState, ReadableState } from '../types';

export type CleanupCallback = () => void;

export type Config = BaseConfig;

export interface StartEvent<
  T extends (ReadableState | ReadableAsyncState)[],
  V extends { [K in keyof T]: InferReadableType<T[K]> },
> {
  states: T;
  values: V;
}

export interface ClearedEvent<T extends (ReadableState | ReadableAsyncState)[]> {
  states: T;
}

export interface Effect<
  T extends (ReadableState | ReadableAsyncState)[],
  V extends { [K in keyof T]: InferReadableType<T[K]> },
> {
  config: Config;
  events: {
    cleared: AwaiEvent<ClearedEvent<T>>;
    started: AwaiEvent<StartEvent<T, V>>;
  };
}
