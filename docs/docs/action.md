---
sidebar_position: 3
---

# Action

Action is just a function with [re-resolvable](/re-resolvable) `events`, which makes them an important part of [scenarios](/scenario).

```ts title="Example action"
const increment = action(() => counter.set(current => current + 1));

setTimeout(increment, 100);

await increment.events.invoked;

console.log(`incremented after 100ms`);
```

### Empty actions

Actions may be empty. When that's the case, they do nothing but emit `invoked` event when called, and this may be used to control a scenario flow.

```ts title="Using empty actions to control scenarios"
const increment = action();
const decrement = action();

scenarioOnEvery(increment.events.invoked, () => {
  counter.set(current => current + 1);
});

scenarioOnEvery(decrement.events.invoked, () => {
  counter.set(current => current - 1);
});
```
