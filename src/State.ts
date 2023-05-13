import { Resolver } from './types';

export default class State<T> {
  protected _value: T;

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  async setValue(newValue: T) {
    this._value = newValue;

    const awaiters = [...this.changed._awaiters];
    this.changed._awaiters = [];
    awaiters.forEach((resolve) => resolve(newValue));

    return Promise.resolve(newValue);
  }

  get value(): T {
    return this._value;
  }

  then(resolve: Resolver<T>) {
    resolve(this.value);
  }

  changed = {
    _awaiters: [] as Resolver<T>[],
    then(resolve: Resolver<T>) {
      this._awaiters.push(resolve);
    },
  };
}
