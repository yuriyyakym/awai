---
---

# Debounce

```ts title="Debounced scenario"
const TIMEOUT_SYMBOL = Symbol();

const counterState = state(0);
const increment = action(() => counter.set(current => current + 1));

scenarioOnEvery(increment.events.invoked, async () => {
  const result = await Promise.race([
    increment.events.invoked,
    delay(DEBOUNCE_TIMEOUT).then(() => TIMEOUT_SYMBOL),
  ]);

  if (result === TIMEOUT_SYMBOL) {
    // Some debounced functionality here
  }
});
```
