import { AwaitableEvent } from '../core';
import { registry } from '../global';
import { isFunction } from '../lib';

import { Config, Scenario } from './types';

type Callback<T, R> = (event: T) => R;

const getDefaultConfig = (hasDependencies: boolean): Config => ({
  strategy: hasDependencies ? 'fork' : 'cyclic',
});

function scenario<T, R>(scenarioFn: Callback<T, R>, config?: Config): Scenario<T, R>;
function scenario<T, R>(
  promiseLikeOrFunction: PromiseLike<T> | (() => PromiseLike<T>),
  scenarioFn: Callback<T, R>,
  config?: Config,
): Scenario<T, R>;

function scenario() {
  type T = unknown;
  type R = unknown;

  const [arg1, arg2, arg3] = arguments;
  const hasDependencies = arguments.length === 3 || isFunction(arg2);
  const [promiseLikeOrFunction, scenarioFn, customConfig] = hasDependencies
    ? [arg1 as PromiseLike<T> | (() => PromiseLike<T>), arg2 as Callback<T, R>, arg3 as Config]
    : [, arg1 as Callback<T, R>, arg2 as Config];

  const defaultConfig = getDefaultConfig(hasDependencies);
  const config = { ...defaultConfig, ...customConfig };

  const events: Scenario<T, R>['events'] = {
    completed: new AwaitableEvent(),
    failed: new AwaitableEvent(),
    started: new AwaitableEvent(),
  };

  const getEventPromise = () => {
    if (!promiseLikeOrFunction) {
      return Promise.resolve();
    }

    return isFunction(promiseLikeOrFunction) ? promiseLikeOrFunction() : promiseLikeOrFunction;
  };

  const run = async () => {
    getEventPromise().then((event: unknown) => {
      events.started.emit({ config, event });

      Promise.resolve(scenarioFn(event))
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

  const scenarioNode: Scenario<T, R> = { events };

  registry.register(scenarioNode);

  run();

  return scenarioNode;
}

export default scenario;
