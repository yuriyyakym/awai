import { AwaitableEvent } from '../lib';

import { Callback, ActionInvokeMeta, ActionInvokedMeta } from './types';

const action = <Args extends any[], Return extends any = any>(
  callback?: Callback<Args, Return>,
) => {
  const hasCallback = typeof callback !== 'undefined';

  const events = {
    invoke: new AwaitableEvent<ActionInvokeMeta<Args>>(),
    invoked: hasCallback ? new AwaitableEvent<ActionInvokedMeta<Args, Return>>() : undefined,
  };

  const invoke = async (...args: Args) => {
    events.invoke.emit({ args });
    const result = callback ? await callback(...args) : (undefined as Return);
    events.invoked?.emit({ args, result });
    return Promise.resolve(result);
  };

  return Object.assign(invoke, { events });
};

export default action;
