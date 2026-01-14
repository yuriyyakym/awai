import { SystemTag } from '../constants';
import { AwaiEvent, flush } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction, isObject } from '../lib';

import { getDefaultStrategy, getExpirationPromise, getTriggerPromise } from './lib';
import type { Callback, Config, Scenario, Trigger } from './types';

const getConfig = <E = unknown>(
  isPlainPromiseTrigger: boolean,
  hasTrigger: boolean,
  customConfig: Partial<Config<E>> = {},
): Config<E> => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(scenario.name),
  strategy: customConfig.strategy ?? getDefaultStrategy(isPlainPromiseTrigger, hasTrigger),
  tags: [SystemTag.SCENARIO, ...(customConfig.tags ?? [])],
});

function scenario<T, R, E = unknown>(
  trigger: Trigger<T>,
  callback: Callback<T, R>,
  customConfig?: Partial<Config<E>>,
): Scenario<T, R, E>;

function scenario<T, R, E = unknown>(
  callback: Callback<T, R>,
  config?: Partial<Config<E>>,
): Scenario<T, R, E>;

function scenario<T, R, E = unknown>(
  ...args: [Trigger<T>, Callback<T, R>, Partial<Config<E>>?] | [Callback<T, R>, Partial<Config<E>>?]
): Scenario<T, R, E> {
  const hasTrigger = isFunction(args[1]);

  const trigger = hasTrigger ? (args[0] as Trigger<T>) : undefined;
  const callback = (hasTrigger ? args[1] : args[0]) as Callback<T, R>;
  const customConfig = (hasTrigger ? args[2] : args[1]) as Partial<Config<E>> | undefined;
  const isPlainPromiseTrigger = hasTrigger && isObject(args[0]) && args[0].constructor === Promise;

  const config = getConfig<E>(isPlainPromiseTrigger, hasTrigger, customConfig);
  const { strategy, until } = config;
  const isFiniteScenario =
    isPlainPromiseTrigger || strategy === 'once' || typeof until !== 'undefined';
  let expirationEvent: E | undefined;
  let runningCallbacksCount = 0;
  let shouldExpire = false;
  let expired = false;

  const events: Scenario<T, R, E>['events'] = {
    fulfilled: new AwaiEvent(),
    rejected: new AwaiEvent(),
    settled: new AwaiEvent(),
    started: new AwaiEvent(),
  };

  const untilPredicate = isFunction(until) ? until : undefined;

  const checkShouldExpire = () =>
    strategy === 'once' || shouldExpire || (untilPredicate ? untilPredicate() : false);

  const expire = async () => {
    if (expired) {
      return;
    }

    expired = true;
    await flush();
    await events.settled.emit({ event: expirationEvent, config });
    await flush();
    await registry.deregister(config.id);
  };

  if (until && !isFunction(until)) {
    getExpirationPromise<E>(until).then((event) => {
      shouldExpire = true;
      expirationEvent = event as E;

      if (runningCallbacksCount === 0) {
        expire();
      }
    });
  }

  const run = async () => {
    getTriggerPromise(trigger).then(
      (event) => {
        if (expired) {
          return;
        }

        runningCallbacksCount++;
        events.started.emit({ config, event });

        try {
          Promise.resolve(callback(event))
            .then((result) => {
              flush().then(() => {
                events.fulfilled.emit({ config, event, result });
              });
            })
            .catch((error) => {
              events.rejected.emit(error);
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
          events.rejected.emit(error);
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

  const then: Scenario<T, R, E>['then'] = (resolve) => {
    if (!isFiniteScenario) {
      console.warn(
        'You seem to await an infinite scenario. This causes a memory leak in your application.',
      );
    }

    if (!isFunction(resolve)) {
      return Promise.resolve(events.settled) as any;
    }

    return events.settled.then(resolve);
  };

  const scenarioNode: Scenario<T, R, E> = { config, events, then };

  registry.register(scenarioNode);

  run();

  return scenarioNode;
}

export default scenario;
