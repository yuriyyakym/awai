import { SystemTag } from '../constants';
import { AwaiEvent, flush } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction, isObject, isPromiseLike } from '../lib';

import { getDefaultStrategy, getTriggerPromise } from './lib';
import type { Callback, Config, ExpirationTrigger, Scenario, Trigger } from './types';

const getConfig = (
  isPlainPromiseTrigger: boolean,
  hasTrigger: boolean,
  customConfig: Partial<Config> = {},
): Config => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(scenario.name),
  strategy: customConfig.strategy ?? getDefaultStrategy(isPlainPromiseTrigger, hasTrigger),
  tags: [SystemTag.SCENARIO, ...(customConfig.tags ?? [])],
});

function scenario<T, R, E>(
  trigger: Trigger<T>,
  callback: Callback<T, R>,
  customConfig?: Partial<Config>,
): Scenario<T, R, E>;

function scenario<T, R, E>(
  trigger: Trigger<T>,
  expirationTrigger: ExpirationTrigger<E>,
  callback: Callback<T, R>,
  customConfig?: Partial<Config>,
): Scenario<T, R, E>;

function scenario<T, R, E = unknown>(
  callback: Callback,
  config?: Partial<Config>,
): Scenario<T, R, E>;

function scenario<T, R, E>(
  ...args:
    | [Trigger<T>, Callback<T, R>, Partial<Config>?]
    | [Trigger<T>, ExpirationTrigger<E>, Callback<T, R>, Partial<Config>?]
    | [Callback, Partial<Config>?]
) {
  const hasTrigger = isFunction(args[1]) || isFunction(args[2]);
  const hasExpirationTrigger = isFunction(args[2]);

  const trigger = hasTrigger ? (args[0] as Trigger<T>) : undefined;
  const expirationTrigger = hasExpirationTrigger ? (args[1] as ExpirationTrigger<E>) : undefined;
  const callback = args.findLast(isFunction) as Callback<T, R>;
  const customConfig = args.at(args.indexOf(callback) + 1) as Partial<Config> | undefined;
  const isPlainPromiseTrigger = hasTrigger && isObject(args[0]) && args[0].constructor === Promise;

  const config = getConfig(isPlainPromiseTrigger, hasTrigger, customConfig);
  const { strategy } = config;
  let { repeat = Infinity } = config;
  let runningCallbacksCount = 0;
  let shouldExpire = false;
  let expired = false;

  const events: Scenario<T, R, E>['events'] = {
    completed: new AwaiEvent(),
    expired: new AwaiEvent(),
    failed: new AwaiEvent(),
    started: new AwaiEvent(),
  };

  const checkShouldExpire = () =>
    repeat <= 0 ||
    strategy === 'once' ||
    shouldExpire ||
    (isFunction(expirationTrigger) && expirationTrigger());

  const expire = async (event?: E) => {
    expired = true;
    await flush();
    await events.expired.emit({ event, config });
    await flush();
    await registry.deregister(config.id);
  };

  if (isPromiseLike(expirationTrigger)) {
    Promise.resolve(expirationTrigger).then((event) => {
      shouldExpire = true;

      if (runningCallbacksCount === 0) {
        expire(event);
      }
    });
  }

  const run = async () => {
    getTriggerPromise(trigger).then(
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

  const scenarioNode: Scenario<T, R, E> = { config, events };

  registry.register(scenarioNode);

  run();

  return scenarioNode;
}

export default scenario;
