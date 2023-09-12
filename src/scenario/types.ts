import { AwaitableEvent } from '../core';

export type Trigger<T> = PromiseLike<T> | (() => PromiseLike<T>);

export type Callback<T, R> = (value: T) => R;

export interface Config {
  strategy: 'fork' | 'cyclic' | 'once';
}

export interface CompletedEvent<T, R> {
  event: T;
  result: R;
  config: Config;
}

export interface StartedEvent<T> {
  event: T;
  config: Config;
}

export interface Scenario<T, R> {
  events: {
    completed: AwaitableEvent<CompletedEvent<T, R>>;
    failed: AwaitableEvent<unknown>;
    started: AwaitableEvent<StartedEvent<T>>;
  };
}
