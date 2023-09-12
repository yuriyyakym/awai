import { type AwaitableEvent } from '../core';
import type { InferReadableType, ReadableAsyncState, ReadableState } from '../types';

export type CleanupCallback = () => void;

export interface RunEvent<
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
  events: {
    cleared: AwaitableEvent<ClearedEvent<T>>;
    run: AwaitableEvent<RunEvent<T, V>>;
  };
}
