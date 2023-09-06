---
sidebar_position: 4
---

# AsyncState

State that handles asynchronous values and emits events required for async management.

```ts 
type InitialValue<T> = T | Promise<T> | (() => Promise<T>);
const asyncState = <T>(initialValue?: InitialValue<T>): AsyncState<T> => { /* ... */ };
```

Properties and methods:
* `get`: method that returns current value
* `getAsync`: method that returns async state `{ isLoading, error, value }`
* `getPromise`: method that returns promise of a value. This is especially helpful when we want to use state value of an async state being initialized
* `getStatus`: method that returns AsyncStatus ('loading', 'loaded', 'failure')
* `set`: A method that sets new value
* `events`: A record of [re-resolvable](/re-resolvable) events:
  - changed
  - failed
  - requested

---

It is possible to set value at any time. If new value is set while state is being loaded, only new promise will be used and outdated promise is ignored when resolved.

```ts title="AsyncState usage setter example"
const delayedGreeting = asyncState(new Promise(resolve => setTimeout(resolve, 100, 'Hello')));

delayedGreeting.set(new Promise(resolve => setTimeout(resolve, 200, 'Hello Awai')));

const greeting = await delayedGreeting.events.changed;

console.log(greeting); // Hello Awai
```

--- 

:::info
Value is stale during consecutive async state updates. That means that if a new promise is set, state will still hold previous value until the promise is resolved.
:::
