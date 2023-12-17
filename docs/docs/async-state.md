---
sidebar_position: 4
---

# AsyncState

State that handles asynchronous values and emits events required for async management.

![AsyncState visual diagram](/diagrams/AsyncState.svg "AsyncState visual diagram")

### Properties and methods

- **config** - resolved config
- **events** - record of [AwaiEvent](/awai-event) events
- **get** - method that returns current value
- **getAsync** - method that returns async state `{ isLoading, error, value }`
- **getPromise** - method that returns promise of a value. This is especially helpful when you want to use value of an async state being initialized. If initialized, promise is resolved with current value right away.
- **getStatus** - method that returns AsyncStatus ('pending', 'fulfilled', 'rejected')
- **set** - method to set new value/promise

### Events
- **changed** - state value is modified
- **fulfilled** - value is loaded
- **rejected** - error occurred while loading a value
- **requested** - new value has been requested
- **ignored** - promise is resolved, but newer version promise is pending

---

It is possible to set value at any time. You can set plain value or a promise.
If new value is set while previous value is still being loaded, only new value/promise will be used, and outdated promise will be ignored when resolved.

```ts title="AsyncState usage setter example"
const delayedGreeting = asyncState(new Promise(resolve => setTimeout(resolve, 100, 'Hello')));

delayedGreeting.set(new Promise(resolve => setTimeout(resolve, 200, 'Hello Awai')));

const greeting = await delayedGreeting.events.changed;

console.log(greeting); // Hello Awai
```

--- 

:::info
Value is stale during consecutive async state updates. That means that if a new promise is set, state will still hold previous value until the last set promise is resolved.
:::

:::info
AsyncState is thennable, hence you can use it as a promise. Eg. instead of using `asyncState.get()` you can use `await asyncState`.
:::

### Types

[Source](https://github.com/yuriyyakym/awai/blob/master/src/async-state/types.ts)

```ts 
const asyncState = <T>(
  initialValue?: InitialValue<T>,
  config?: Partial<Config>
): AsyncState<T> => { /* ... */ };

type InitialValue<T> = T | Promise<T> | (() => Promise<T>);

interface Config {
  id: string;
  tags: string[];
}
```
