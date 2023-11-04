import { type AwaiEvent } from '../core';
import { type noop } from '../lib';
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
  failed: AwaiEvent<unknown>;
};

export type EventsWithCallback<Args, Return> = BaseEvents<Args> & {
  completed: AwaiEvent<ActionCompletedEvent<Args, Return>>;
};

type EmptyAction = typeof noop & {
  config: Config;
  events: BaseEvents<[]>;
};

type CallbackAction<Callback extends AnyCallback> = Callback & {
  config: Config;
  events: EventsWithCallback<Parameters<Callback>, ReturnType<Callback>>;
};

export type Action<Callback extends AnyCallback | void> = Callback extends AnyCallback
  ? CallbackAction<Callback>
  : EmptyAction;
