import { AwaitableEvent } from './lib';
import State from './State';

type FamilyMap<T> = Record<string, State<T>>;

export default class FamilyState<T> extends State<FamilyMap<T>> {
  constructor() {
    super({} as FamilyMap<T>);
  }

  get(key: string): State<T> {
    const state = this.value[key];
    return state;
  }

  async set(key: string, item: State<T>) {
    this.setValue({ ...this.value, [key]: item });
    this.itemSet.emit([key, item.value]);
    return Promise.resolve(item);
  }

  async delete(key: string) {
    const { [key]: removedValue, ...restValue } = this.value;
    this.setValue(restValue as FamilyMap<T>);
    this.itemDeleted.emit([key, removedValue.value]);
    return Promise.resolve(removedValue);
  }

  has(key: string) {
    return key in this.value;
  }

  keys() {
    return Object.keys(this.value);
  }

  itemSet = new AwaitableEvent();

  itemDeleted = new AwaitableEvent();
}
