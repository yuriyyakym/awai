import { AwaitableEvent, isFunction } from '../lib';

import { Callback } from './types';

const action = <Args extends any[], Return extends any>(callback?: Callback<Args, Return>) => {
  const hasCallback = isFunction(callback);

  const events = {
    invoked: new AwaitableEvent<Args>(),
    failed: hasCallback ? new AwaitableEvent<any>() : undefined,
    completed: hasCallback ? new AwaitableEvent<Return>() : undefined,
  };

  const invoke = async (...args: Args) => {
    events.invoked.emit(args);
    try {
      const result = callback ? await callback(...args) : (undefined as Return);
      events.completed?.emit(result);
      return result;
    } catch (error) {
      events.failed?.emit(error);
      throw error;
    }
  };

  return Object.assign(invoke, { events });
};

export default action;
