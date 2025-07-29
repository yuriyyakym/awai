---
sidebar_position: 6
---

# Action

Action is a function that emits events. It may have a callback or be empty.
Actions are useful for triggering scenarios or controlling async flows.

![Empty action visual diagram](/diagrams/EmptyAction.svg "Empty action visual diagram")

![Action visual diagram](/diagrams/Action.svg "Action visual diagram")

:::info Return value
Action returns a promise which is resolved after callback is finished and all event listeners got notified. If action callback returns a value, promise is resolved with that value.
:::

### Properties

- **config** - resolved config
- **events** - record of [AwaiEvent](/awai-event) events

### Events:

- **invoked** - emits `ActionInvokedEvent` when action is called
- **fulfilled** - emits `ActionFulfilledEvent` when action is finished successfully
- **rejected** - emits `ActionRejectedEvent` when callback throws or returns a rejected promise

---

```ts title="Example action"
const increment = action(() => counter.set(current => current + 1));

setTimeout(increment, 100);

await increment.events.invoked;

console.log(`incremented after 100ms`);
```

### Empty actions

Actions may be empty. When that's the case, they only emit `invoked` event.

```ts title="Using empty actions to control scenarios"
const increment = action();

scenario(increment.events.invoked, () => {
  counter.set(current => current + 1);
});
```

Empty actions can still receive arguments which will be available in event payloads.
If you use TypeScript, you can specify arguments types:

```ts title="Passing arguments to an empty action in order to have better control over scenario"
const createTask = action<[title: string, description: string]>();

scenario(createTask.events.invoked, (event) => {
  const [title, description] = event.arguments;
  // handle task creation
});

createTask('Task title', 'Task description');
```

---

### Types

[Source](https://github.com/yuriyyakym/awai/blob/master/src/action/types.ts)

```ts
type ActionInvokedEvent<Args> = {
  arguments: Args;
  config: Config;
  invocationId: string;
};

type ActionFulfilledEvent<Args, Return> = {
  arguments: Args;
  config: Config;
  result: Return;
  invocationId: string;
};

type ActionRejectedEvent<Args> = {
  arguments: Args;
  config: Config;
  error: unknown;
  invocationId: string;
};
```

---
