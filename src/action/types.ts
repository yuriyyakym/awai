import { type AwaiEvent } from '../core';
import type { BaseConfig } from '../types';

export type Config = BaseConfig & Record<string, any>;

export type AnyCallback = (...args: any) => any;

export type ActionInvokedEvent<Args> = {
  arguments: Args;
  config: Config;
};

export type ActionFulfilledEvent<Args, Return> = {
  arguments: Args;
  config: Config;
  result: Awaited<Return>;
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
  fulfilled: AwaiEvent<ActionFulfilledEvent<Args, Return>>;
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
