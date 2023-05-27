# [DIRTY DRAFT] JavaScript state management library

Minimalistic, dependency-free, written in TypeScript.
Besides state management utils, this repository suggests unique architectural approach.
The architecture consists of three main parts: state, action and scenario.
The library was written using a concept of a promise-like object which has no terminal state and may resolve multiple times. Let's call it re-resolvable.

Such re-resolvable can be used instead of event emitters, and when you try to do so, you are naturally forced into a different way of algorithmic thinking.

Let's create a simple state node, and dive deeper.

```ts
const counter = state(0);
```

`counter` is an object with following properties: `get`, `set`, `events`.
While `get` and `set` methods are self-explanatory, `events` property is quite unusual - every event is re-resolvable.
As of now, there is only `changed` event on state node.

A piece of code may be better than thousand of words:

```ts
const counter = state(0);

setTimeout(counter.set, 100, 'hello');
setTimeout(counter.set, 200, 'there');

const value1 = await counter.events.changed;
const value2 = await counter.events.changed; 

console.log(`${value1} ${value2}`); // hello there
```
It's quite remarkable that `counter.events.changed` has always the same reference. Notice how it was resolved with two different values in the above snippet.

---

It's time to create some actions.

```ts
const increment = action(() => counter.set(current => current + 1));
const decrement = action(() => counter.set(current => current - 1));
```

Action is just a function which, similarly to state objects, has its re-resolvable `events`, for example:

```ts
setTimeout(increment, 100);

await increment.events.invoked;

console.log(`incremented after 100ms`);
```

More utils with re-resolvable events to come in future.

All this brings us to the `scenario` concept - an async function, which describes small piece of logics.
Let's say we've got a new requirement to preserve counter in `sessionStorage` (write-only for now).

```ts
scenario(async () => {
  const value = await counter.events.changed;
  sessionStorage.setItem('counter', value);
});
```

Scenario is a sequence of awaited events. Since those events are promise-like, they may be combined with other promises using Promise methods like `any`, `race`, `all`, etc.

Side note: beware of stale values when using `Promise.all`. Let's say you want a scenario to happen only after both user and license state nodes are updated.

```ts
// Wrong - user or license may be outdated
const [user, license] = await Promise.all([
  userState.events.changed,
  licenseState.events.changed,
]);

// Good - both user and license are up to date
await Promise.all([userState.events.changed, licenseState.events.changed]);
const user = userState.get();
const license = licenseState.get();
```

This library provides variety of syntax sugar helpers for scenarios. Like: `scenarioOnEvery`, `scenarioOnce`. More to be described later.

This is how you can implement state preserving using `scenarioOnEvery`:
```ts
scenarioOnEvery(counter.events.changed, async () => {
  // There are two ways to retrieve state value: `state.get()` and `await state`
  sessionStorage.setItem('counter', await counter);
});
```

---

Actions may be empty. When that's the case, they do nothing but emit `invoked` event when called, and this may be used to control a scenario flow. This is how we can implement `increment` and `decrement` functionalities:

```ts
const increment = action();
const decrement = action();

scenarioOnEvery(increment.events.invoked, () => {
  counter.set(current => current + 1);
});

scenarioOnEvery(decrement.events.invoked, () => {
  counter.set(current => current - 1);
});
```
---

More advanced example how to implement a debounced scenario:

```ts
const TIMEOUT_SYMBOL = Symbol();

scenarioOnEvery(increment.events.invoked, async () => {
  const result = await Promise.race([
    click.events.invoked
    delay(DEBOUNCE_TIMEOUT).then(() => TIMEOUT_SYMBOL),
  ]);

  if (result === TIMEOUT_SYMBOL) {
    // Some debounced functionality here
  }
});
```
