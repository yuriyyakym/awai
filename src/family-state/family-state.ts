import asyncState, { AsyncState } from '../async-state';
import { AwaitableEvent } from '../lib';
import { scenarioOnEvery } from '../scenario';
import state, { State } from '../state';
import { FamilyState, Resolver } from '../types';

type Id = string;

const familyState = <
  T,
  Initializer extends (id: Id) => T | Promise<T>,
  Family extends Record<Id, NodeType>,
  NodeType = ReturnType<Initializer> extends PromiseLike<infer Q>
    ? AsyncState<Q>
    : State<ReturnType<Initializer>>,
>(
  initializer: Initializer,
): FamilyState<NodeType> => {
  const family = state<Family>({} as Family);

  const events = {
    changed: new AwaitableEvent<Record<Id, NodeType>>(),
    stateCreated: new AwaitableEvent<Id>(),
  };

  const getNode = (id: Id): NodeType => {
    if (id in family.get()) {
      return family.get()[id];
    }

    const initialValue = initializer(id);

    const stateNode =
      initialValue instanceof Promise ? asyncState(initialValue) : state(initialValue);

    family.set((current) => ({ ...current, [id]: stateNode }));
    events.stateCreated.emit(id);
    events.changed.emit(family.get());

    scenarioOnEvery(stateNode.events.changed, async () => {
      events.changed.emit(family.get());
    });

    return stateNode as NodeType;
  };

  const setNode = (id: Id, stateNode: NodeType) => {
    family.set((current) => ({ ...current, [id]: stateNode }));
    events.changed.emit(family.get());
  };

  const get = () => {
    return family.get();
  };

  const then = async (resolve: Resolver<Family>): Promise<Family> => {
    const result = await resolve(family.get());
    return result;
  };

  return { events, get, getNode, setNode, then };
};

export default familyState;
