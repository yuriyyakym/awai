import asyncState, { type AsyncState } from '../async-state';
import { SystemTag } from '../constants';
import { AwaiEvent, flush } from '../core';
import { registry } from '../global';
import { getUniqueId, isFunction } from '../lib';
import scenario from '../scenario';
import state, { type State } from '../state';
import type { Id } from '../types';

import type { Config, FamilyState } from './types';

const getConfig = (customConfig: Partial<Config> = {}): Config => ({
  ...customConfig,
  id: customConfig.id ?? getUniqueId(familyState.name),
  tags: [SystemTag.FAMILY_STATE, ...(customConfig.tags ?? [])],
});

const familyState = <
  T,
  Initializer extends (id: Id) => T | Promise<T>,
  Family extends Record<Id, NodeType>,
  NodeType extends State<any> | AsyncState<any> = ReturnType<Initializer> extends PromiseLike<
    infer Q
  >
    ? AsyncState<Q>
    : State<ReturnType<Initializer>>,
>(
  initializer: Initializer,
  customConfig?: Partial<Config>,
): FamilyState<NodeType> => {
  const config = getConfig(customConfig);

  let family: Family = {} as Family;

  const events = {
    changed: new AwaiEvent<Record<Id, NodeType>>(),
    stateCreated: new AwaiEvent<Id>(),
  };

  const getNode = (id: Id): NodeType => {
    if (id in family) {
      return family[id];
    }

    const initialValue = initializer(id);

    const stateNode =
      initialValue instanceof Promise
        ? asyncState(initialValue, { tags: [SystemTag.CORE_NODE] })
        : state(initialValue, { tags: [SystemTag.CORE_NODE] });

    family = { ...family, [id]: stateNode };
    events.stateCreated.emit(id);
    events.changed.emit(family);

    scenario(
      stateNode.events.changed,
      () => {
        events.changed.emit(family);
      },
      { tags: [SystemTag.CORE_NODE] },
    );

    return stateNode as NodeType;
  };

  const setNode = async (id: Id, stateNode: NodeType) => {
    if (id in family) {
      throw new Error(`Cannot set node. Node with id "${id}" already exists.`);
    }

    family = { ...family, [id]: stateNode };

    scenario(
      stateNode.events.changed,
      () => {
        events.changed.emit(family);
      },
      { tags: [SystemTag.CORE_NODE] },
    );

    events.changed.emit(family);

    await flush();
  };

  const get = () => {
    return family;
  };

  const then: FamilyState<NodeType>['then'] = async (resolve) => {
    if (!isFunction(resolve)) {
      return family as any;
    }

    return resolve(family);
  };

  const familyStateNode: FamilyState<NodeType> = { config, events, get, getNode, setNode, then };

  registry.register(familyStateNode);

  return familyStateNode;
};

export default familyState;
