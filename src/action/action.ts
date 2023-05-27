import { AwaitableEvent, isFunction } from '../lib';

import { AsyncEvents, BaseEvents, Callback } from './types';

function action<Args extends any[]>(): Function & { events: BaseEvents<Args> };
function action<Args extends any[], Return extends any>(
  T: Callback<Args, Return>,
): Callback<Args, Return> & { events: AsyncEvents<Args, Return> };

function action<Args extends [], Return extends any>(
  callback?: Callback<Args, Return>,
): Function & { events: AsyncEvents<Args, Return> } {
  const hasCallback = isFunction(callback);

  const events = {
    invoked: new AwaitableEvent<Args>(),
    failed: new AwaitableEvent<any>(),
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

  return Object.assign(invoke, { events: events as any });
}

export default action;
