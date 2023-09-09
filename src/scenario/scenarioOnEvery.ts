import { type AwaitableEvent } from '../core';
import { noop } from '../lib';

const scenarioOnEvery = async <T>(
  awaitableEvent: AwaitableEvent<T>,
  scenarioFn: (event: T) => any,
) => {
  const scenario = async () => {
    awaitableEvent.then((event) => {
      Promise.resolve(scenarioFn(event)).catch(noop);
      queueMicrotask(scenario);
    });
  };

  scenario();
};

export default scenarioOnEvery;
