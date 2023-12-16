---
sidebar_position: 5
---

# Selector

Selector is used to combine multiple states into a single value. It is read-only.


![Sync selector visual diagram](/diagrams/SyncSelector.svg "Sync selector visual diagram")

If any of dependencies or combining predicate is async, selector becomes async selector.

![Async selector visual diagram](/diagrams/AsyncSelector.svg "Async selector visual diagram")

:::info Info
If at least one of async dependencies rejects, resulting selector rejects with [AggregateError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError).
:::

### Properties and methods

#### Sync selector
- **get** - method that returns current value
- **events** - record of [AwaiEvent](/awai-event) events
  - **changed** - is emitted when state value is modified

#### Async selector
- **config** - resolved config
- **get** - method that returns current value
- **getAsync** - method that returns async state `{ isLoading, error, value }`
- **getPromise** - method that returns promise of a value. This is especially helpful when you want to use value of an async state being initialized. If initialized, promise is resolved with current value right away.
- **getStatus** - method that returns AsyncStatus ('pending', 'fulfilled', 'rejected')
- **events** - record of [AwaiEvent](/awai-event) events
  - **changed** - new value is calculated
  - **fulfilled** - value is loaded
  - **rejected** - error occurred while loading a value
  - **requested** - new value has been requested
  - **ignored** - promise is resolved, but newer version promise is pending. Emits `VersionIgnoredEvent`.

### Examples

```ts title="Usage example - Sync Selector"
const number1State = state(1);
const number2State = state(2);

const sumState = selector(
  [number1State, number2State],
  (number1, number2) => number1 + number2
);

console.log(sumState.get()); // 3
```

```ts title="Usage example - Async Selector"
const greetingState = state('Hello');
const nameState = asyncState(new Promise(resolve => setTimeout(resolve, 100, 'Awai')));

const messageState = selector(
  [greetingState, nameState],
  (greeting, name) => `${greeting} ${name}`
);

console.log(messageState.getStatus()); // "pending"
console.log(messageState.get()); // undefined

const message = await messageState.events.changed;

console.log(message); // Hello Awai
console.log(messageState.get()); // Hello Awai
```

---

### Types

[Source](https://github.com/yuriyyakym/awai/blob/master/src/selector/types.ts)

```ts
export type VersionIgnoredEvent<T> = {
  error?: unknown;
  value?: T;
  version: number;
};
```
