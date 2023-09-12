---
sidebar_position: 9
---

# Effect

Effect invokes its predicate as soon as any dependency is changed. The predicate is not invoked if there is any unitialized async dependency.

Predicate should return a cleanup function if cleanup needed.

```ts
function effect<
  T extends (ReadableState | ReadableAsyncState)[],
  V extends { [K in keyof T]: InferReadableType<T[K]> },
>(
  states: [...T],
  effect: (...values: V) => CleanupCallback | void
): Effect<T, V>;
```

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

## Types

```ts
type CleanupCallback = () => void;

export interface RunEvent<
  T extends (ReadableState | ReadableAsyncState)[],
  V extends { [K in keyof T]: InferReadableType<T[K]> },
> {
  states: T;
  values: V;
}

export interface ClearedEvent<T extends (ReadableState | ReadableAsyncState)[]> {
  states: T;
}

export interface Effect<
  T extends (ReadableState | ReadableAsyncState)[],
  V extends { [K in keyof T]: InferReadableType<T[K]> },
> {
  events: {
    cleared: AwaitableEvent<ClearedEvent<T>>;
    run: AwaitableEvent<RunEvent<T, V>>;
  };
}
```
