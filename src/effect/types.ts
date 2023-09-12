import { type AwaitableEvent } from '../core';
import { InferReadableType } from '../types';

export type CleanupCallback = () => void;

export interface RunEvent<T extends any[], V extends { [K in keyof T]: InferReadableType<T[K]> }> {
  states: T;
  values: V;
}

export interface ClearedEvent<T extends any[]> {
  states: T;
}

export interface Effect<T extends any[], V extends { [K in keyof T]: InferReadableType<T[K]> }> {
  events: {
    cleared: AwaitableEvent<ClearedEvent<T>>;
    run: AwaitableEvent<RunEvent<T, V>>;
  };
}
