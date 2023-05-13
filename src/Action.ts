import { Resolver } from './types';

export default class Action<Args extends [], Callback extends (...args: Args) => void> {
  private callback?: Callback;
  private awaiters: Resolver<Args>[] = [];

  constructor(callback?: Callback) {
    this.callback = callback;
  }

  then(resolve: Resolver<Args>) {
    this.awaiters.push(resolve);
  }

  async call(...args: Args) {
    const awaiters = [...this.awaiters];
    this.awaiters = [];
    awaiters.forEach((resolve) => resolve(args));

    const result = this.callback ? await this.callback(...args) : undefined;
    return Promise.resolve(result);
  }
}
