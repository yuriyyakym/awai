---
sidebar_position: 8
---

# Scenario

Conceptually, `Scenario` is a sequence of events, that are described by a piece of promise-based code. It is designed to simplify state management and asynchronous control flow in your application.

Scenario may start instantly or may be triggered by promise-like objects.

```ts
type Trigger<T> = PromiseLike<T> | (() => PromiseLike<T>);
type Callback<T, R> = (value: T) => R;

interface Config {
  id: string;
  tags: [];
  strategy: 'fork' | 'cyclic' | 'once';
}

function scenario<T, R>(callback: Callback<T, R>, config?: Partial<Config>): Scenario<T, R>;

function scenario<T, R>(trigger: Trigger<T>, callback: Callback<T, R>, config?: Partial<Config>): Scenario<T, R>;
```


## Strategies

- **fork** - runs scenarios in parallel
- **cyclic** - runs scenario only if previous one is completed
- **once** - run scenario only one time

:::info Default strategy
By default instant scenarios use `cyclic` strategy, whereas scenarios with trigger use `fork` strategy. Exceptionally, if a trigger is a plain promise, default strategy is `once`, but this is a very unlikely case.
:::

## Examples

```ts title="Scenario of writing every counter change into sessionStorage" description="abc"
scenario(counter.events.changed, (value) => {
  sessionStorage.setItem('counter', value);
});
```

```ts title="Scenario that re-fetches data every N seconds or by clicking a refresh button"
// Trigger may be a function returning a promise.
// This makes it possible to combine multiple promise-likes.
const dataRevalidateScenario = scenario(
  () => Promise.any([delay(REFETCH_INTERVAL), refresh.events.invoked]),
  async () => {
    const data = await fetchData();
    dataState.set(data);
  },
  { strategy: 'cyclic' }
);
```

```ts title="Scenario has its events, which may be used to trigger another scenario"
scenario(dataRevalidateScenario.events.completed, () => {
  console.log('Data revalidated')
});
```

#### Other types

```ts title="Other types"
export interface CompletedEvent<T, R> {
  event: T;
  result: R;
  config: Config;
}

export interface StartedEvent<T> {
  event: T;
  config: Config;
}

export interface Scenario<T, R> {
  events: {
    completed: AwaiEvent<CompletedEvent<T, R>>;
    failed: AwaiEvent<unknown>;
    started: AwaiEvent<StartedEvent<T>>;
  };
}
```
