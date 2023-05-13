import { Resolver } from './types';

export default class Action<Callback extends (...args: any) => any> {
  private callback?: Callback;
  private awaiters: Resolver<Parameters<Callback>>[] = [];

  constructor(callback?: Callback) {
    this.callback = callback;
  }

  then(resolve: Resolver<Parameters<Callback>>) {
    this.awaiters.push(resolve);
  }

  async call(...args: Parameters<Callback>) {
    const awaiters = [...this.awaiters];
    this.awaiters = [];
    awaiters.forEach((resolve) => resolve(args));

    const result = this.callback ? this.callback(args) : undefined;
    return Promise.resolve(result);
  }
}
