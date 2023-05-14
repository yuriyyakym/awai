export type ActionInvokeMeta<Args> = {
  args: Args;
};

export type ActionInvokedMeta<Args, Return> = {
  args: Args;
  result: Return;
};

export type Callback<A extends any[], R extends any> = (...args: A) => R;
