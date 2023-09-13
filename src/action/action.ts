import { AwaitableEvent } from '../core';
import { registry } from '../global';
import { isFunction, isPromiseLike } from '../lib';

import type { AsyncEvents, BaseEvents, Callback } from './types';

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

  const invoke = (...args: Args) => {
    events.invoked.emit(args);

    try {
      const valueOrPromise: Return | Promise<Return> = isFunction(callback)
        ? callback(...args)
        : (undefined as Return);

      if (isPromiseLike(valueOrPromise)) {
        return valueOrPromise.then((value: any) => {
          events.completed?.emit(value);
          return value;
        });
      }

      return valueOrPromise;
    } catch (error) {
      events.failed?.emit(error);
      throw error;
    }
  };

  const actionNode = Object.assign(invoke, { events: events as any });

  registry.register(actionNode);

  return actionNode;
}

export default action;
