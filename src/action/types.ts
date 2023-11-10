import { type AwaiEvent } from '../core';
import type { BaseConfig } from '../types';

export type Config = BaseConfig;

export type AnyCallback = (...args: any) => any;

export type ActionInvokedEvent<Args> = {
  arguments: Args;
  config: Config;
};

export type ActionCompletedEvent<Args, Return> = {
  arguments: Args;
  config: Config;
  result: Return;
};

export type BaseEvents<Args> = {
  invoked: AwaiEvent<ActionInvokedEvent<Args>>;
};

export type EventsWithCallback<Args, Return> = BaseEvents<Args> & {
  completed: AwaiEvent<ActionCompletedEvent<Args, Return>>;
  failed: AwaiEvent<unknown>;
};

export type EmptyAction<Args extends any[]> = ((...args: Args) => void) & {
  config: Config;
  events: BaseEvents<Args>;
};

export type CallbackAction<Args extends any[], Return = void> = ((...args: Args) => Return) & {
  config: Config;
  events: EventsWithCallback<Args, Return>;
};
