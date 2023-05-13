import State from './State';
import { Resolver } from './types';

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

    const awaiters = [...this.itemSet._awaiters];
    this.itemSet._awaiters = [];
    awaiters.forEach((resolve) => resolve([key, item.value]));

    return Promise.resolve(item);
  }

  async delete(key: string) {
    const { [key]: removedValue, ...restValue } = this.value;
    this.setValue(restValue as FamilyMap<T>);

    const awaiters = [...this.itemDeleted._awaiters];
    this.itemDeleted._awaiters = [];
    awaiters.forEach((resolve) => resolve([key, removedValue.value]));

    return Promise.resolve(removedValue);
  }

  has(key: string) {
    return key in this.value;
  }

  keys() {
    return Object.keys(this.value);
  }

  itemSet = {
    _awaiters: [] as Resolver<[string, T]>[],
    then(resolve: Resolver<[string, T]>) {
      this._awaiters.push(resolve);
    },
  };

  itemDeleted = {
    _awaiters: [] as Resolver<[string, T]>[],
    then(resolve: Resolver<[string, T]>) {
      this._awaiters.push(resolve);
    },
  };
}
