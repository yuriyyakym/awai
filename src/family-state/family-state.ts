import asyncState, { AsyncState } from '../async-state';
import { AwaitableEvent } from '../core';
import { registry } from '../global';
import { isFunction } from '../lib';
import scenario from '../scenario';
import state, { State } from '../state';
import type { FamilyState, Id } from '../types';

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
  let family: Family = {} as Family;

  const events = {
    changed: new AwaitableEvent<Record<Id, NodeType>>(),
    stateCreated: new AwaitableEvent<Id>(),
  };

  const getNode = (id: Id): NodeType => {
    if (id in family) {
      return family[id];
    }

    const initialValue = initializer(id);

    const stateNode =
      initialValue instanceof Promise ? asyncState(initialValue) : state(initialValue);

    family = { ...family, [id]: stateNode };
    events.stateCreated.emit(id);
    events.changed.emit(family);

    scenario(stateNode.events.changed, async () => {
      events.changed.emit(family);
    });

    return stateNode as NodeType;
  };

  const setNode = (id: Id, stateNode: NodeType) => {
    family = { ...family, [id]: stateNode };
    events.changed.emit(family);
  };

  const get = () => {
    return family;
  };

  const then: FamilyState<NodeType>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return undefined as any;
    }

    return resolve(family);
  };

  const familyStateNode: FamilyState<NodeType> = { events, get, getNode, setNode, then };

  registry.register(familyStateNode);

  return familyStateNode;
};

export default familyState;
