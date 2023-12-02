import { type AwaiEvent } from '../core';
import type { BaseConfig } from '../types';

export type Config = BaseConfig;

export type AnyCallback = (...args: any) => any;

export type ActionInvokedEvent<Args> = {
  arguments: Args;
  config: Config;
};

export type ActionResolvedEvent<Args, Return> = {
  arguments: Args;
  config: Config;
  result: Return;
};

export type ActionRejectedEvent<Args> = {
  arguments: Args;
  config: Config;
  error: unknown;
};

export type BaseEvents<Args> = {
  invoked: AwaiEvent<ActionInvokedEvent<Args>>;
};

export type EventsWithCallback<Args, Return> = BaseEvents<Args> & {
  fulfilled: AwaiEvent<ActionResolvedEvent<Args, Return>>;
  rejected: AwaiEvent<ActionRejectedEvent<Args>>;
};

export type EmptyAction<Args extends any[]> = ((...args: Args) => Promise<void>) & {
  config: Config;
  events: BaseEvents<Args>;
};

export type CallbackAction<Args extends any[], Return = void> = ((
  ...args: Args
) => Promise<Return>) & {
  config: Config;
  events: EventsWithCallback<Args, Return>;
};
