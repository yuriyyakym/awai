import { AwaitableEvent } from '../lib';
import state, { State } from '../state';
import { Family, FamilyMap } from './types';

const family = <T, M extends FamilyMap<T> = FamilyMap<T>>(): Family<T> => {
  const items = state<M>({} as M);

  const events = {
    itemDelete: new AwaitableEvent<[string, T]>(),
    itemSet: new AwaitableEvent(),
  };

  const getItem = (key: string) => {
    return items.get()[key]?.get();
  };

  const getItemState = (key: string) => {
    return items.get()[key];
  };

  const set = async (key: string, item: T) => {
    const value = state(item);
    items.set({ ...items.get(), [key]: value });
    return value;
  };

  const setState = async (key: string, item: State<T>) => {
    items.set({ ...items.get(), [key]: item });
    return item;
  };

  const deleteFn = async (key: string) => {
    const { [key]: removedItem, ...restItems } = items.get();
    events.itemDelete.emit([key, removedItem.get()]);
    items.set(restItems as M);
    return Promise.resolve(removedItem);
  };

  const keys = () => Object.keys(items);

  const has = (key: string) => Object.keys(items.get()).includes(key);

  return { delete: deleteFn, has, getItem, getItemState, keys, set, setState };
};

export default family;