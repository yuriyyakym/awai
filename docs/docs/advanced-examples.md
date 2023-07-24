---
sidebar_position: 6
---

# Advanced examples

```ts title="Debounced scenario"
const TIMEOUT_SYMBOL = Symbol();

scenarioOnEvery(increment.events.invoked, async () => {
  const result = await Promise.race([
    increment.events.invoked
    delay(DEBOUNCE_TIMEOUT).then(() => TIMEOUT_SYMBOL),
  ]);

  if (result === TIMEOUT_SYMBOL) {
    // Some debounced functionality here
  }
});
```
