import { SystemTag } from '../constants';
import { AwaiEvent } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction } from '../lib';

import type { Callback, Config, Scenario, Trigger } from './types';

const getDefaultStrategy = (
  isPlainPromiseTrigger: boolean,
  hasDependencies: boolean,
): Config['strategy'] => {
  if (isPlainPromiseTrigger) {
    return 'once';
  }

  if (hasDependencies) {
    return 'fork';
  }

  return 'cyclic';
};

const getConfig = (
  isPlainPromiseTrigger: boolean,
  hasDependencies: boolean,
  customConfig: Partial<Config> = {},
): Config => ({
  id: customConfig.id ?? getUniqueId(scenario.name),
  strategy: customConfig.strategy ?? getDefaultStrategy(isPlainPromiseTrigger, hasDependencies),
  tags: [SystemTag.SCENARIO, ...(customConfig.tags ?? [])],
});

function scenario<T, R>(callback: Callback, config?: Partial<Config>): Scenario<T, R>;

function scenario<T, R>(
  trigger: Trigger<T>,
  callback: Callback<T, R>,
  customConfig?: Partial<Config>,
): Scenario<T, R>;

function scenario<T, R>(
  ...args: [Trigger<T>, Callback<T, R>, Partial<Config>?] | [Callback, Partial<Config>?]
) {
  const hasDependencies = arguments.length === 3 || isFunction(args[1]);
  const isPlainPromiseTrigger = hasDependencies && arguments[0].constructor === Promise;
  const [trigger, callback, customConfig] = hasDependencies
    ? (args as [Trigger<T>, Callback<T, R>, Partial<Config>])
    : ([, ...args] as [undefined, Callback<T, R>, Partial<Config>]);

  const config = getConfig(isPlainPromiseTrigger, hasDependencies, customConfig);

  const events: Scenario<T, R>['events'] = {
    completed: new AwaiEvent(),
    failed: new AwaiEvent(),
    started: new AwaiEvent(),
  };

  const getEventPromise = () => {
    if (!trigger) {
      return Promise.resolve(undefined as T);
    }

    return isFunction(trigger) ? trigger() : trigger;
  };

  const run = async () => {
    getEventPromise().then((event) => {
      events.started.emit({ config, event });

      Promise.resolve(callback(event))
        .then((result) => {
          events.completed.emit({ config, event, result });
        })
        .catch((error) => {
          events.failed.emit(error);
        })
        .finally(() => {
          if (config.strategy === 'cyclic') {
            queueMicrotask(run);
          }
        });

      if (config.strategy === 'fork') {
        queueMicrotask(run);
      }
    });
  };

  const scenarioNode: Scenario<T, R> = { config, events };

  registry.register(scenarioNode);

  run();

  return scenarioNode;
}

export default scenario;
