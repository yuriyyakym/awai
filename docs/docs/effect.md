---
sidebar_position: 9
---

# Effect

Effect invokes its predicate as soon as any dependency is changed. The predicate is not invoked until there is any unitialized/rejected async dependency.

Predicate should return a cleanup function if cleanup needed.

![Effect visual diagram](/diagrams/Effect.svg "Effect visual diagram")

### Properties

- **config** - resolved config
- **events** - record of [AwaiEvent](/awai-event) events

### Events

- **started** - emits `StartEvent` when any dependency changed
- **cleared** - emits `ClearedEvent` after cleanup (if cleanup callback was returned by callback)

### Usage

```ts
effect(states, effect, config?)
```

### Examples

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

### Types

[Source](https://github.com/yuriyyakym/awai/blob/master/src/effect/types.ts)

```ts
interface Config {
  id: string;
  tags: string[];
}

type CleanupCallback = () => void;

export interface StartEvent<
  T extends (ReadableState | ReadableAsyncState)[],
  V extends { [K in keyof T]: InferReadableType<T[K]> },
> {
  states: T;
  values: V;
}

export interface ClearedEvent<T extends (ReadableState | ReadableAsyncState)[]> {
  states: T;
}
```
