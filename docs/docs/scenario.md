---
sidebar_position: 8
---

# Scenario

Conceptually, `Scenario` is a sequence of events, that are described by a piece of promise-based code. It is designed to simplify state management and asynchronous control flow in your application.

Scenario may start instantly or may be triggered by promise-like objects.

Scenario may be infinite or finite, if `expirationTrigger` is specified.

```ts
type Trigger<T> = PromiseLike<T> | (() => PromiseLike<T>);
type Callback<T, R> = (value: T) => R;

function scenario<T, R, E>(
  trigger: Trigger<T>,
  callback: Callback<T, R>,
  customConfig?: Partial<Config>,
): Scenario<T, R, E>;

function scenario<T, R, E>(
  trigger: Trigger<T>,
  expirationTrigger: ExpirationTrigger<E>,
  callback: Callback<T, R>,
  customConfig?: Partial<Config>,
): Scenario<T, R, E>;

function scenario<T, R, E = unknown>(
  callback: Callback,
  config?: Partial<Config>,
): Scenario<T, R, E>;
```


## Strategies

- **fork** - runs scenarios in parallel
- **cyclic** - runs scenario only if previous one is completed
- **once** - run scenario only one time

:::info Default strategy
By default instant scenarios use `cyclic` strategy, whereas scenarios with trigger use `fork` strategy. Exceptionally, if a trigger is a plain promise, default strategy is `once`, but this is a very unlikely case.
:::

## Events

- **started** - emitted on every scenario callback run
- **fulfilled** - emitted when scenario callback finished running
- **rejected** - emitted when callback throws
- **settled** - emitted when no more callbacks will be run

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
scenario(dataRevalidateScenario.events.fulfilled, () => {
  console.log('Data revalidated')
});
```

#### Other types

```ts title="Other types"
interface Config {
  id: string;
  tags: [];
  strategy: 'fork' | 'cyclic' | 'once';
}

type ShouldExpirePredicate = () => boolean;
export type ExpirationTrigger<T> = AwaiEvent<T> | PromiseLike<T> | ShouldExpirePredicate;

export interface FulfilledEvent<T, R> {
  event: T;
  result: R;
  config: Config;
}

export interface SettledEvent<T> {
  event?: T;
  config: Config;
}

export interface StartedEvent<T> {
  event: T;
  config: Config;
}

export interface Scenario<T, R, E> {
  events: {
    fulfilled: AwaiEvent<FulfilledEvent<T, R>>;
    rejected: AwaiEvent<unknown>;
    settled: AwaiEvent<ExpiredEvent<E>>;
    started: AwaiEvent<StartedEvent<T>>;
  }
}
```
