---
---

# Debounce

```ts title="Debounced scenario"
const DEBOUNCE_TIMEOUT = 300;

const counterState = state(0);
const increment = action();

scenario(increment.events.invoked, async () => {
  const result = await Promise.race([
    delay(DEBOUNCE_TIMEOUT),
    increment.events.invoked.then(() => Promise.reject()),
  ]);

  counterState.set(value => value + 1)
});
```
