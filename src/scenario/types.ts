import type { AwaiEvent } from '../core';
import type { BaseConfig } from '../types';

export type Trigger<T> = AwaiEvent<T> | PromiseLike<T> | (() => PromiseLike<T>);

type ShouldExpirePredicate = () => boolean;
export type ExpirationTrigger<T> = AwaiEvent<T> | PromiseLike<T> | ShouldExpirePredicate;

export type Callback<T = never, R = any> = (value: T) => R;

export interface Config extends BaseConfig, Record<string, any> {
  repeat?: number;
  strategy: 'fork' | 'cyclic' | 'once';
}

export interface FulfilledEvent<T, R> {
  event: T;
  result: R;
  config: Config;
}

export interface SettledEvent<T> {
  event?: T;
  config: Config;
}

export interface StartedEvent<T> {
  event: T;
  config: Config;
}

export interface Scenario<T, R, E> {
  events: {
    fulfilled: AwaiEvent<FulfilledEvent<T, R>>;
    rejected: AwaiEvent<unknown>;
    settled: AwaiEvent<SettledEvent<E>>;
    started: AwaiEvent<StartedEvent<T>>;
  };
  get config(): Config;
  then: AwaiEvent<SettledEvent<E>>['then'];
}
