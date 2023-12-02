import { SystemTag } from '../constants';
import { AwaiEvent, flush } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction } from '../lib';
import type { BaseConfig } from '../types';

import type { CallbackAction, Config, EmptyAction } from './types';

const getConfig = (customConfig: Partial<Config> = {}): Config => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(action.name),
  tags: [SystemTag.ACTION, ...(customConfig.tags ?? [])],
});

function action<Args extends any[] = []>(): EmptyAction<Args>;
function action<Args extends any[] = []>(config?: Partial<BaseConfig>): EmptyAction<Args>;
function action<Args extends any[], Return = void>(
  callback: (...args: Args) => Return,
  config?: Partial<BaseConfig>,
): CallbackAction<Args, Return>;

function action<Args extends any[], Return = void>(
  ...args: [Partial<BaseConfig>?] | [(...args: Args) => Return, Partial<BaseConfig>?]
): EmptyAction<Args> | CallbackAction<Args, Return> {
  type Action = EmptyAction<Args> | CallbackAction<Args, Return>;

  const hasCallback = isFunction(args[0]);
  const [callback, customConfig] = hasCallback
    ? (args as [(...args: Args) => Return, Partial<BaseConfig>?])
    : ([, ...args] as [undefined, Partial<BaseConfig>?]);

  const config = getConfig(customConfig);

  const events = {
    invoked: new AwaiEvent(),
    rejected: hasCallback ? new AwaiEvent() : undefined,
    resolved: hasCallback ? new AwaiEvent() : undefined,
  } satisfies Action['events'];

  const invoke = async (...invokeArgs: Args) => {
    events.invoked.emit({ arguments: invokeArgs, config });

    try {
      const valueOrPromise: Return | Promise<Return> = isFunction(callback)
        ? callback(...invokeArgs)
        : (undefined as Return);

      const value = await valueOrPromise;
      await flush();
      events.resolved?.emit({ arguments: invokeArgs, config, result: value });
      return value;
    } catch (error) {
      events.rejected?.emit({
        arguments: invokeArgs,
        config,
        error,
      });
      throw error;
    }
  };

  const actionNode = Object.assign(invoke, { config, events }) as Action;

  registry.register(actionNode);

  return actionNode;
}

export default action;
