---
sidebar_position: 4
---

# Selector

Selector is used to combine multiple states into a single value. It is read-only.

```ts title="ReadableState - returned when all state dependencies are sync"
interface ReadableState<T> {
  events: {
    changed: AwaitableEvent<T>;
  };
  get: () => T;
  then: (resolver: Resolver<T>) => Promise<T>;
}
```

```ts title="ReadableAsyncState - returned when any dependency is async"
interface ReadableAsyncState<T> {
  events: {
    changed: AwaitableEvent<T>;
    failed: AwaitableEvent<unknown>;
    requested: AwaitableEvent<void>;
  };
  get: () => T | undefined;
  getAsync: () => AsyncValue<T>; // { isLoading, error, value }
  getPromise: () => Promise<T>;
  getStatus: () => AsyncStatus;
  then: (resolver: Resolver<T>) => Promise<T>;
}
```

---

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
