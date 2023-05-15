import { AwaitableEvent } from '../lib';

import { Callback } from './types';

const action = <Args extends any[], Return extends any = any>(
  callback?: Callback<Args, Return>,
) => {
  const hasCallback = typeof callback !== 'undefined';

  const events = {
    invoke: new AwaitableEvent<Args>(),
    invoked: hasCallback ? new AwaitableEvent<Return>() : undefined,
  };

  const invoke = async (...args: Args) => {
    events.invoke.emit(args);
    const result = callback ? await callback(...args) : (undefined as Return);
    events.invoked?.emit(result);
    return Promise.resolve(result);
  };

  return Object.assign(invoke, { events });
};

export default action;
