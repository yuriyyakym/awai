import { SystemTag } from '../constants';
import { AwaiEvent, flush } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction, isObject, isPromiseLike } from '../lib';

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
  ...customConfig,
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
  const hasDependencies = args.length === 3 || isFunction(args[1]);
  const isPlainPromiseTrigger =
    hasDependencies && isObject(args[0]) && args[0].constructor === Promise;
  const [trigger, callback, customConfig] = hasDependencies
    ? (args as [Trigger<T>, Callback<T, R>, Partial<Config>])
    : ([, ...args] as [undefined, Callback<T, R>, Partial<Config>]);

  const config = getConfig(isPlainPromiseTrigger, hasDependencies, customConfig);
  const { repeatUntil, strategy } = config;
  let { repeat = Infinity } = config;
  let runningCallbacksCount = 0;
  let shouldExpire = false;
  let expired = false;

  const events: Scenario<T, R>['events'] = {
    completed: new AwaiEvent(),
    expired: new AwaiEvent(),
    failed: new AwaiEvent(),
    started: new AwaiEvent(),
  };

  const checkShouldExpire = () =>
    repeat <= 0 ||
    strategy === 'once' ||
    shouldExpire ||
    (isFunction(repeatUntil) && repeatUntil());

  const expire = async () => {
    expired = true;
    await flush();
    await events.expired.emit({ config });
    await flush();
    await registry.deregister(config.id);
  };

  const getEventPromise = () => {
    if (!trigger) {
      return Promise.resolve(undefined as T);
    }

    return isFunction(trigger) ? trigger() : trigger;
  };

  if (isPromiseLike(repeatUntil)) {
    Promise.resolve(repeatUntil).then(() => {
      shouldExpire = true;

      if (runningCallbacksCount === 0) {
        expire();
      }
    });
  }

  const run = async () => {
    getEventPromise().then(
      (event) => {
        repeat--;

        if (expired) {
          return;
        }

        runningCallbacksCount++;
        events.started.emit({ config, event });

        try {
          Promise.resolve(callback(event))
            .then((result) => {
              flush().then(() => {
                events.completed.emit({ config, event, result });
              });
            })
            .catch((error) => {
              events.failed.emit(error);
            })
            .finally(() => {
              runningCallbacksCount--;

              if (checkShouldExpire() && runningCallbacksCount === 0) {
                expire();
                return;
              }

              if (strategy === 'cyclic') {
                queueMicrotask(run);
              }
            });
        } catch (error) {
          runningCallbacksCount--;
          events.failed.emit(error);
        }

        if (strategy === 'fork') {
          queueMicrotask(run);
        }
      },
      () => {
        queueMicrotask(run);
      },
    );
  };

  const scenarioNode: Scenario<T, R> = { config, events };

  registry.register(scenarioNode);

  run();

  return scenarioNode;
}

export default scenario;
