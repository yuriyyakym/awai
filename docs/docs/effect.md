---
sidebar_position: 9
---

# Effect

Effect invokes its predicate as soon as any dependency is changed. The predicate is not invoked if any dependency is async and is not initialized yet.

Predicate should return a function if cleanup needed.

## Examples

```ts title="Effect controlled by a state"
const isMouseLogginEnabledState = state<boolean>(false);

effect([isMouseLogginEnabledState], (isMouseLogginEnabled) => {
  if (!isMouseLogginEnabled) {
    return;
  }

  const eventHandler = (event) => console.log(event);
  
  document.addEventListener('mousemove', eventHandler);

  return () => {
    document.removeEventListener('mousemove', eventHandler);
  }
});

isMouseLogginEnabledState.set(true); // enable logging
```

