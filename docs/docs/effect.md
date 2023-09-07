---
sidebar_position: 9
---

# Effect

Effect invokes its predicate as soon as any dependency is changed. The predicate is not invoked if there is any unitialized async dependency.

Predicate should return a cleanup function if cleanup needed.

## Examples

```ts title="Effect controlled by a state"
const isMouseLoggingEnabledState = state<boolean>(false);

effect([isMouseLoggingEnabledState], (isMouseLogginEnabled) => {
  if (!isMouseLogginEnabled) {
    return;
  }

  const eventHandler = (event) => console.log(event);
  
  document.addEventListener('mousemove', eventHandler);

  return () => {
    document.removeEventListener('mousemove', eventHandler);
  }
});

isMouseLoggingEnabledState.set(true); // enable logging
```

