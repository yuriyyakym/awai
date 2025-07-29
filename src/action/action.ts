import { SystemTag } from '../constants';
import { AwaiEvent, flush } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction } from '../lib';

import type { CallbackAction, Config, EmptyAction } from './types';

const getConfig = (customConfig: Partial<Config> = {}): Config => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(action.name),
  tags: [SystemTag.ACTION, ...(customConfig.tags ?? [])],
});

function action<Args extends any[] = []>(): EmptyAction<Args>;
function action<Args extends any[] = []>(config?: Partial<Config>): EmptyAction<Args>;
function action<Args extends any[], Return = void>(
  callback: (...args: Args) => Return,
  config?: Partial<Config>,
): CallbackAction<Args, Return>;

function action<Args extends any[], Return = void>(
  ...args: [Partial<Config>?] | [(...args: Args) => Return, Partial<Config>?]
): EmptyAction<Args> | CallbackAction<Args, Return> {
  type Action = EmptyAction<Args> | CallbackAction<Args, Return>;

  const hasCallback = isFunction(args[0]);
  const [callback, customConfig] = hasCallback
    ? (args as [(...args: Args) => Return, Partial<Config>?])
    : ([, ...args] as [undefined, Partial<Config>?]);

  const config = getConfig(customConfig);

  const events = {
    invoked: new AwaiEvent(),
    rejected: hasCallback ? new AwaiEvent() : undefined,
    fulfilled: hasCallback ? new AwaiEvent() : undefined,
  } satisfies Action['events'];

  const invoke = async (...invokeArgs: Args) => {
    const invocationId = getUniqueId('invocation');

    events.invoked.emit({ arguments: invokeArgs, config, invocationId });

    try {
      const valueOrPromise: Return | Promise<Return> = isFunction(callback)
        ? callback(...invokeArgs)
        : (undefined as Return);

      const value = await valueOrPromise;
      await flush();
      events.fulfilled?.emit({ arguments: invokeArgs, config, result: value, invocationId });
      return value;
    } catch (error) {
      events.rejected?.emit({
        arguments: invokeArgs,
        config,
        error,
        invocationId,
      });
      throw error;
    }
  };

  const actionNode = Object.assign(invoke, { config, events }) as Action;

  registry.register(actionNode);

  return actionNode;
}

export default action;
