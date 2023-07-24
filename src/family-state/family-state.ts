import { AwaitableEvent } from '../lib';
import state from '../state';
import { FamilyState, ReadableAsyncState, ReadableState, Resolver } from '../types';

type Key = string;

const familyState = <T extends ReadableState<any> | ReadableAsyncState<any>>(): FamilyState<T> => {
  type Family = Record<string, T>;

  const family = state<Family>({});
  let mounted = true;

  const events = {
    changed: new AwaitableEvent<Family>(),
    set: new AwaitableEvent<T>(),
  };

  const get = (): Family => {
    return family.get();
  };

  const getNode = (id: Key): T => family.get()[id];

  const set = (id: Key, stateNode: T) => {
    family.set((current) => ({ ...current, [id]: stateNode }));
    events.set.emit(stateNode);
  };

  const then = async (resolve: Resolver<Family>): Promise<Family> => {
    const result = await resolve(get());
    return result;
  };

  (async () => {
    while (mounted) {
      /**
       * @todo Cleanup when disposed
       * @see https://github.com/yuriyyakym/awai/issues/1
       */
      await Promise.race([
        events.set,
        ...Object.values(family.get()).map((stateNode) => stateNode.events.changed),
      ]);

      events.changed.emit(family.get());
    }
  })();

  return { events, get, getNode, set, then };
};

export default familyState;
