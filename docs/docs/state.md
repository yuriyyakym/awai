---
sidebar_position: 3
---

# State

State is a an object which stores data and emits event when it changes.

![State visual diagram](/diagrams/State.svg "State visual diagram")

### Properties and methods

- **config** - resolved config
- **events** - record of [AwaiEvent](/awai-event) events
- **get** - method that returns current value
- **set** - method that sets new value

### Events
- **changed** - state value is modified

### Config
- **compare** - optional comparator used to skip updates.

### Examples

```ts title="State usage"
const counter = state(0);

setTimeout(counter.set, 100, 'hello');
setTimeout(counter.set, 200, 'awai');

const value1 = await counter.events.changed;
const value2 = await counter.events.changed; 

console.log(`${value1} ${value2}`); // hello awai
```

:::info Hint
It's quite remarkable that `counter.events.changed` has always the same reference. Notice how it was resolved with two different values in the snippet above.
:::


```ts title="Update state using callback"
const counter = state(1);

counter.set((current) => current + 1);

console.log(counter.get()); // 2
```

### Types

[Source](https://github.com/yuriyyakym/awai/blob/master/src/state/types.ts)

```ts 
const state = <T>(initialValue: T, config?: Partial<Config<T>>): State<T> => { /* ... */ };

type Config<T> = {
  id: string;
  tags: string[];
  compare?: (next: T, previous: T) => boolean;
};
```
