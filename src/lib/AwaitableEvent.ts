import { Resolver } from '../types';

export default class AwaitableEvent<T> {
  private _awaiters: Resolver<T>[] = [];

  then(resolve: Resolver<T>) {
    this._awaiters.push(resolve);
  }

  emit(value: T) {
    const awaiters = Array.from(this._awaiters);
    this._awaiters = [];
    awaiters.forEach((resolve) => resolve(value));
  }
}
