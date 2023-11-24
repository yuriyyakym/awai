import type { AwaiEvent } from '../core';
import type { BaseConfig } from '../types';

export type Trigger<T> = AwaiEvent<T> | PromiseLike<T> | (() => PromiseLike<T>);

export type Callback<T = never, R = any> = (value: T) => R;

type RepeatUntilPredicate = () => boolean;

export interface Config extends BaseConfig {
  repeat?: number;
  repeatUntil?: AwaiEvent | PromiseLike<unknown> | RepeatUntilPredicate;
  strategy: 'fork' | 'cyclic' | 'once';
}

export interface CompletedEvent<T, R> {
  event: T;
  result: R;
  config: Config;
}

export interface ExpiredEvent {
  config: Config;
}

export interface StartedEvent<T> {
  event: T;
  config: Config;
}

export interface Scenario<T, R> {
  events: {
    completed: AwaiEvent<CompletedEvent<T, R>>;
    expired: AwaiEvent<ExpiredEvent>;
    failed: AwaiEvent<unknown>;
    started: AwaiEvent<StartedEvent<T>>;
  };
  get config(): Config;
}
