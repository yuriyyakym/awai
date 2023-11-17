import type { AwaiEvent } from '../core';
import type { BaseConfig } from '../types';

export type Trigger<T> = AwaiEvent<T> | PromiseLike<T> | (() => PromiseLike<T>);

export type Callback<T = never, R = any> = (value: T) => R;

export interface Config extends BaseConfig {
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
  stop(): void;
  events: {
    completed: AwaiEvent<CompletedEvent<T, R>>;
    failed: AwaiEvent<unknown>;
    started: AwaiEvent<StartedEvent<T>>;
    stopped: AwaiEvent<void>;
  };
  get config(): Config;
}
