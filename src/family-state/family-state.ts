import asyncState, { AsyncState } from '../async-state';
import { AwaitableEvent } from '../lib';
import { scenarioOnEvery } from '../scenario';
import state, { State } from '../state';
import { FamilyState, Resolver } from '../types';

type Id = string;

const familyState = <
  T,
  Initializer extends (id: Id) => T | Promise<T>,
  NodeType extends ReturnType<Initializer> extends PromiseLike<T> ? AsyncState<T> : State<T>,
  Family extends Record<Id, NodeType>,
>(
  initializer: Initializer,
): FamilyState<NodeType, Family> => {
  const family = state<Family>({} as Family);

  const events = {
    changed: new AwaitableEvent<Family>(),
  };

  const getNode = (id: Id): NodeType => {
    if (id in family.get()) {
      return family.get()[id];
    }

    const initialValue = initializer(id);

    const nodeState =
      initialValue instanceof Promise ? asyncState(initialValue) : state(initialValue);

    family.set((current) => ({ ...current, [id]: nodeState }));

    events.changed.emit(family.get());

    scenarioOnEvery(nodeState.events.changed, async () => {
      events.changed.emit(family.get());
    });

    return nodeState as NodeType;
  };

  const get = () => {
    return family.get();
  };

  const then = async (resolve: Resolver<Family>): Promise<Family> => {
    const result = await resolve(family.get());
    return result;
  };

  return { events, get, getNode, then };
};

export default familyState;
