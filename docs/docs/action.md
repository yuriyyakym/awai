---
sidebar_position: 6
---

# Action

Action is a wrapper for any function. Action has its `events` object, which makes it useful for controlling [scenarios](/scenario).

Action has following events:
  - `invoked` - emits `ActionInvokedEvent` when action is called
  - `resolved` - emits `ActionResolvedEvent` when action is finished successfully
  - `rejected` - emits an error if inner callback throws or returns a rejected promise

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

Empty actions may receive arguments which are accessible from events.

```ts title="Passing arguments to an empty action in order to have better control over scenario"
const createTask = action<[title: string, description: string]>();

scenario(createTask.events.invoked, (event) => {
  const [title, description] = event.arguments;
  // handle task creation
});

createTask('Task title', 'Task description');
```

---

:::info Return value
Action returns a promise which is resolved after all related awai nodes are updated.
:::

### Types

[Source](https://github.com/yuriyyakym/awai/blob/master/src/action/types.ts)

```ts
export type ActionInvokedEvent<Args> = {
  arguments: Args;
  config: Config;
};

export type ActionResolvedEvent<Args, Return> = {
  arguments: Args;
  config: Config;
  result: Return;
};
```

---

