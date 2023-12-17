---
sidebar_position: 8
---

# FamilyState

Helper that creates and aggregates state nodes.

When creating familyState you have to pass initializer - function used to determine newly created state value.
When requesting new node with `getNode` method, either [State](/state) or [AsyncState](/async-state) is returned, basing on initializer return type.

Internally `FamilySate` is a read-only `State` object, hence it may be used in selectors, scenarios, effects or combined with promises.

![FamilyState visual diagram](/diagrams/FamilyState.svg "FamilyState visual diagram")

### Properties and methods

- **config** - resolved config
- **events** - record of [AwaiEvent](/awai-event) events
- **get** - returns whole family object with with `State`/`AsyncState` values
- **getNode** - returns existing or creates new `State`/`AsyncState` using initializer
- **setNode** - is used to manually set a state for specific id. When used, `stateCreated` event is not emitted

### Events

- **changed** - state is created or any inner state emitted `changed` event
- **stateCreated** - new state is created with `getNode` method

### Examples

```ts title="Family of sync states"
const ID1 = 'id1';
const ID2 = 'id2';

const getNameById = (id) => ({ [ID1]: 'John', [ID2]: 'Andrew' })[id];

const namesFamily = familyState(getNameById);

const greetingState = selector(
  [namesFamily],
  (namesStates) => {
    const names = Object.values(namesStates).map(state => state.get());
    return names.length === 0
      ? 'Nobody to greet'
      : `Hello ${names.join(' & ')}`;
  },
);

greetingState.get(); // 'Nobody to greet'

namesFamily.getNode(ID1);
namesFamily.getNode(ID2);

await greetingState.events.changed; // 'Hello John & Andrew'
await namesFamily.getNode(ID1).set('David');

greetingState.get(); // 'Hello David & Andrew'
```


```ts title="Family of async states"
const initializer = async (id) => wait(100).then(() => getNameById(id));
const namesFamily = familyState(initializer);

const state1 = namesFamily.getNode(ID1);
const state2 = namesFamily.getNode(ID2);

const states = namesFamily.get(); // Record<Id, AsyncState<string>>

await namesFamily.getNode(ID1).getPromise(); // 'John'
await namesFamily.getNode(ID2).getPromise(); // 'Andrew'

Object.values(namesFamily.get()).map(state => state.get()); // ['John', 'Andrew']
```

```ts title="Async family usage with selector"
const initializer = async (id) => wait(100).then(() => getNameById(id));

const activePersonIdState = state(ID1);
const namesFamily = familyState(initializer);

const activePersonState = selector(
  [activePersonIdState, namesFamily],
  (activePersonId, _namesStates) => {
    return namesFamily.getNode(activePersonId).getPromise();
  },
);

activePersonState.get(); // 'John'

await activePersonIdState.set(ID2);

activePersonState.get(); // 'Andrew'
```

:::note
Notice how `_namesStates` is ignored in selector predicate. In this example this argument is added only for clarity, that this argument is passed by selector.
It is recommended to access node via `getNode` method, since it is safer in case if node does not exist yet.
:::

### Types

[Source](https://github.com/yuriyyakym/awai/blob/master/src/family-state/types.ts)

```ts
interface Config {
  id: string;
  tags: string[];
}

function familyState<
  T,
  Initializer extends (id: Id) => T | Promise<T>,
  Family extends Record<Id, NodeType>,
  NodeType = ReturnType<Initializer> extends PromiseLike<infer Q>
    ? AsyncState<Q>
    : State<ReturnType<Initializer>>,
>(initializer: Initializer, config?: Partial<Config>): FamilyState<NodeType>;
```
