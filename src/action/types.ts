import { AwaitableEvent } from '../lib';

export type ActionInvokeMeta<Args> = {
  args: Args;
};

export type ActionInvokedMeta<Args, Return> = {
  args: Args;
  result: Return;
};

export type Callback<A extends any[], R extends any> = (...args: A) => R;

export type BaseEvents<Args> = {
  invoked: AwaitableEvent<Args>;
  failed: AwaitableEvent<any>;
};

export type AsyncEvents<Args, Return> = BaseEvents<Args> & {
  completed: AwaitableEvent<Return>;
};
