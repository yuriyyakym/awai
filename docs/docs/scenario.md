---
sidebar_position: 7
---

# Scenario

Conceptually, `Scenario` is a sequence of events, that are described by a piece of promise-based code. It is designed to simplify state management and asynchronous control flow in your application.

Scenario may start instantly or may be triggered by promise-like objects.

Scenario may be infinite or finite, if `expirationTrigger` argument or `repeat` config property is specified.

In most cases triggered scenarios are used. Trigger can be:
- **[AwaiEvent](/awai-event)** - `scenario(state.events.change, callback)`
- **Promise** - `scenario(promise, callback)` - _callback will run once when promise is resolved_
- **Promise factory** - `scenario(() => Promise.race([...]), callback)`

### Strategies

- **fork** - runs scenarios in parallel
- **cyclic** - runs scenario only if previous one is completed
- **once** - run scenario only one time

### Events

- **started** - emits `StartedEvent` on every scenario callback run
- **fulfilled** - emits `FulfilledEvent` when scenario callback finished running
- **rejected** - emitted when callback throws
- **settled** - emits `SettledEvent` when no more callbacks will be run

### Diagrams

**Fork scenario** may be useful when you want to handle every event. Be careful of race conditions when using this strategy.

![Infinite fork scenario visual diagram](/diagrams/InfiniteScenarioFork.svg "Infinite fork scenario visual diagram")

**Cyclic scenario** may be useful when you want to make sure that callback would not be called until previous one is finished. For example, if you want to ignore all the refresh button clicks, until previous refresh is finished.

![Infinite cyclic scenario visual diagram](/diagrams/InfiniteScenarioCyclic.svg "Infinite cyclic scenario visual diagram")

**Finite scenario** may be useful when useful when you want scenario to run specific amount of times, or until some event is emitted/promise resolved.
For example, in [Paint example](https://github.com/yuriyyakym/awai-paint/blob/master/src/state/scenarios/draw-line.ts), subscenario is listening to `draw` event, until `stopDraw` event is emitted.

![Finite cyclic scenario visual diagram](/diagrams/FiniteScenario.svg "Finite cyclic scenario visual diagram")

### Overloads

#### Instant scenario
```ts
scenario(callback, config?)
```
Default strategy: **cyclic**

#### Infinite scenario
```ts
scenario(trigger, callback, config?)
```
Default strategy: **fork**

#### Finite scenario
```ts
scenario(trigger, expirationTrigger, callback, config?)
```
Default strategy: **fork**

---

:::info Exception
If a trigger is a plain promise, default strategy is `once`.
:::

:::note Repeat config
Every scenario may become finite if `repeat` config property is specified.
:::

:::note Thennable scenario
Finite scenarios are thennable, that means you can await their settlement. It helps to write declarative flows, as in [Paint](https://codesandbox.io/p/github/yuriyyakym/awai-paint/master?file=%2Fsrc%2Fstate%2Fscenarios%2Fdraw-line.ts) example.
:::

### Examples

The best place to see how scenarios may be used and combined is [Safe counter](https://codesandbox.io/p/sandbox/awai--cunter-qk7h6p?file=%2Fsrc%2Fstate.ts) or [Awai Paint](https://codesandbox.io/p/github/yuriyyakym/awai-paint/master?file=%2Fsrc%2Fstate%2Fscenarios%2Fdraw-line.ts) examples.

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

```ts title="Scenario that logs 'Hello Awai' 3 times every one second"
scenario(
  () => new Promise(resolve => setTimeout(resolve, 1000)),
  () => {
    console.log('Hello Awai')
  },
  { repeat: 3 },
);
```

### Types types
 
[Source](https://github.com/yuriyyakym/awai/blob/master/src/scenario/types.ts)

```ts title="Other types"
type Trigger<T> = PromiseLike<T> | (() => PromiseLike<T>);

type Callback<T, R> = (value: T) => R;

interface Config {
  id: string;
  repeat?: number;
  strategy: 'fork' | 'cyclic' | 'once';
  tags: [];
}

type ShouldExpirePredicate = () => boolean;
type ExpirationTrigger<T> = AwaiEvent<T> | PromiseLike<T> | ShouldExpirePredicate;

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
```
