import { SystemTag } from '../constants';
import { AwaitableEvent } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction, isPromiseLike } from '../lib';
import type { BaseConfig } from '../types';

import type { Action, AnyCallback, Config } from './types';

const getConfig = (customConfig: Partial<Config> = {}): Config => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(action.name),
  tags: [SystemTag.ACTION, ...(customConfig.tags ?? [])],
});

function action(): Action<void>;
function action<Callback extends AnyCallback>(config?: Partial<BaseConfig>): Action<Callback>;
function action<Callback extends AnyCallback>(
  callback: C,
  config?: Partial<BaseConfig>,
): Action<Callback>;

function action<Callback extends AnyCallback | void>(
  ...args: [Partial<BaseConfig>?] | [Callback, Partial<BaseConfig>?]
): Action<Callback> {
  type Args = Parameters<Action<Callback>>;
  type Return = ReturnType<Action<Callback>>;

  const hasCallback = isFunction(args[0]);
  const [callback, customConfig] = hasCallback
    ? (args as [Callback, Partial<BaseConfig>?])
    : ([, ...args] as [undefined, Partial<BaseConfig>?]);

  const config = getConfig(customConfig);

  const events = {
    invoked: new AwaitableEvent(),
    failed: new AwaitableEvent(),
    completed: hasCallback ? new AwaitableEvent() : undefined,
  } satisfies Action<Callback>['events'];

  const invoke = (...invokeArgs: [...Args]) => {
    events.invoked.emit({ arguments: invokeArgs, config });

    try {
      const valueOrPromise: Return | Promise<Return> = isFunction(callback)
        ? callback(...invokeArgs)
        : (undefined as Return);

      if (isPromiseLike(valueOrPromise)) {
        return valueOrPromise.then((value) => {
          events.completed?.emit({ arguments: invokeArgs, config, result: value });
          return value;
        });
      }

      return valueOrPromise;
    } catch (error) {
      events.failed?.emit(error);
      throw error;
    }
  };

  const actionNode = Object.assign(invoke, { config, events }) as Action<Callback>;

  registry.register(actionNode);

  return actionNode;
}

export default action;
