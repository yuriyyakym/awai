---
sidebar_position: 7
---

# Scenario

Conceptually, `Scenario` is a sequence of events, that are described by a piece of promise-based code.

`scenario` is a syntax sugar replacement for [infinite loops](/re-resolvable#how-to-replace-replace-event-emitter-with-re-resolvable).

```ts title="Scenario of writing every counter change into sessionStorage"
scenario(async () => {
  const value = await counter.events.changed;
  sessionStorage.setItem('counter', value);
});
```

There are different variations of scenarios:

* `scenario` - calls its async callback in an infinite loop
* `scenarioOnce` - scenario which calls its callback only once
* `scenarioOnEvery` - calls its callback on every re-resolvable emit

---

```ts title="Use scenarioOnEvery in order to preserve state in sessionStorage"
scenarioOnEvery(counter.events.changed, async () => {
  // There are two ways of retrieving state value: `state.get()` and `await state`
  sessionStorage.setItem('counter', await counter);
});
```

:::info
As for now, if scenario throws an error, it is ignored.
:::
