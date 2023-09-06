---
sidebar_position: 3
---

# State

State is a synchronous object which keeps data and emits events.

```ts
const counter = state(0);
```

The state object has the following properties:

* `get`: A method that returns current value
* `set`: A method that sets new value
* `events`: A record of [re-resolvable](/re-resolvable) events

```ts title="State usage"
const counter = state(0);

setTimeout(counter.set, 100, 'hello');
setTimeout(counter.set, 200, 'awai');

const value1 = await counter.events.changed;
const value2 = await counter.events.changed; 

console.log(`${value1} ${value2}`); // hello awai
```

It's quite remarkable that `counter.events.changed` has always the same reference. Notice how it was resolved with two different values in the above snippet.
