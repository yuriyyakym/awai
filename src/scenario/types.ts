import type { AwaiEvent } from '../core';
import type { BaseConfig } from '../types';

export type Trigger<T> = AwaiEvent<T> | PromiseLike<T> | (() => PromiseLike<T>);

export type ShouldExpirePredicate = () => boolean;
export type UntilTrigger<T> = AwaiEvent<T> | PromiseLike<T> | ShouldExpirePredicate | AbortSignal;

export type Callback<T = never, R = any> = (value: T) => R;

export interface Config<T = unknown> extends BaseConfig, Record<string, any> {
  strategy: 'fork' | 'cyclic' | 'once';
  until?: UntilTrigger<T>;
}

export interface FulfilledEvent<T, R, E = unknown> {
  event: T;
  result: R;
  config: Config<E>;
}

export interface SettledEvent<T> {
  event?: T;
  config: Config<T>;
}

export interface StartedEvent<T, E = unknown> {
  event: T;
  config: Config<E>;
}

export interface Scenario<T, R, E = unknown> {
  events: {
    fulfilled: AwaiEvent<FulfilledEvent<T, R, E>>;
    rejected: AwaiEvent<unknown>;
    settled: AwaiEvent<SettledEvent<E>>;
    started: AwaiEvent<StartedEvent<T, E>>;
  };
  get config(): Config<E>;
  then: AwaiEvent<SettledEvent<E>>['then'];
}
