import type { AwaiEvent } from '../core';
import type { BaseConfig } from '../types';

export type Trigger<T> = AwaiEvent<T> | PromiseLike<T> | (() => PromiseLike<T>);

type ShouldExpirePredicate = () => boolean;
export type ExpirationTrigger<T> = AwaiEvent<T> | PromiseLike<T> | ShouldExpirePredicate;

export type Callback<T = never, R = any> = (value: T) => R;

export interface Config extends BaseConfig {
  repeat?: number;
  strategy: 'fork' | 'cyclic' | 'once';
}

export interface CompletedEvent<T, R> {
  event: T;
  result: R;
  config: Config;
}

export interface ExpiredEvent<T> {
  event?: T;
  config: Config;
}

export interface StartedEvent<T> {
  event: T;
  config: Config;
}

export interface Scenario<T, R, E> {
  events: {
    completed: AwaiEvent<CompletedEvent<T, R>>;
    expired: AwaiEvent<ExpiredEvent<E>>;
    failed: AwaiEvent<unknown>;
    started: AwaiEvent<StartedEvent<T>>;
  };
  get config(): Config;
  then: AwaiEvent<ExpiredEvent<E>>['then'];
}
