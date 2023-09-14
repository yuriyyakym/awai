import { AwaitableEvent } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction } from '../lib';

import { Callback, Config, Scenario, Trigger } from './types';

const getDefaultConfig = (hasDependencies: boolean): Partial<Config> => ({
  id: getUniqueId(),
  strategy: hasDependencies ? 'fork' : 'cyclic',
});

function scenario<T, R>(callback: Callback<T, R>, config?: Partial<Config>): Scenario<T, R>;

function scenario<T, R>(
  trigger: Trigger<T>,
  callback: Callback<T, R>,
  config?: Partial<Config>,
): Scenario<T, R>;

function scenario<T, R>(
  ...args: [Trigger<T>, Callback<T, R>, Partial<Config>?] | [Callback<T, R>, Partial<Config>?]
) {
  const hasDependencies = arguments.length === 3 || isFunction(args[1]);
  const [trigger, callback, customConfig] = hasDependencies
    ? (args as [Trigger<T>, Callback<T, R>, Partial<Config>])
    : ([, ...args] as [undefined, Callback<T, R>, Partial<Config>]);

  const defaultConfig = getDefaultConfig(hasDependencies);
  const config = { ...defaultConfig, ...customConfig };

  const events: Scenario<T, R>['events'] = {
    completed: new AwaitableEvent(),
    failed: new AwaitableEvent(),
    started: new AwaitableEvent(),
  };

  const getEventPromise = () => {
    if (!trigger) {
      return Promise.resolve();
    }

    return isFunction(trigger) ? trigger() : trigger;
  };

  const run = async () => {
    getEventPromise().then((event: T) => {
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
