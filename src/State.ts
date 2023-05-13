import { AwaitableEvent } from './lib';
import { Resolver } from './types';

export default class State<T> {
  protected _value: T;

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  async setValue(newValue: T) {
    this._value = newValue;
    this.changed.emit(newValue);
    return Promise.resolve(newValue);
  }

  get value(): T {
    return this._value;
  }

  then(resolve: Resolver<T>) {
    resolve(this.value);
  }

  changed = new AwaitableEvent();
}
