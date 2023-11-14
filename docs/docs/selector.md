---
sidebar_position: 5
---

# Selector

Selector is used to combine multiple states into a single value. It is read-only.

```ts title="Usage example"
const greetingState = state('Hello');
const nameState = asyncState(new Promise(resolve => setTimeout(resolve, 100, 'Awai')));

const messageState = selector(
  [greetingState, nameState],
  (greeting, name) => `${greeting} ${name}`
);

const message = await messageState.events.changed;

console.log(message); // Hello Awai
```

---

### Types

```ts title="ReadableState - returned when all state dependencies are sync"
interface ReadableState<T> {
  events: {
    changed: AwaiEvent<T>;
  };
  get: () => T;
  then: (resolver: Resolver<T>) => Promise<T>;
}
```

```ts title="ReadableAsyncState - returned when any dependency is async"
interface ReadableAsyncState<T> {
  events: {
    changed: AwaiEvent<T>;
    failed: AwaiEvent<unknown>;
    requested: AwaiEvent<void>;
  };
  get: () => T | undefined;
  getAsync: () => AsyncValue<T>; // { isLoading, error, value }
  getPromise: () => Promise<T>;
  getStatus: () => AsyncStatus;
  then: (resolver: Resolver<T>) => Promise<T>;
}
```
