---
sidebar_position: 2
---

# Architecture

The architecture consists of the following Awai nodes: [state](/state), [async-state](/async-state), [family-state](/family-state), [selector](/selector), [action](/action), [scenario](/scenario), [effect](/effect).

The library was written using a concept of a promise-like object which has no terminal state and may resolve multiple times. Let's call it [AwaiEvent](/awai-event).

Such event can be used instead of event emitters, and when you try to do so, you are naturally forced into a different way of writing application logics.

Every Awai node has `events` property. Every event is an instance of [AwaiEvent](/awai-event). Those events may be used to control [scenarios](/scenario) or be mixed into any async flow.

When writing code, consider splitting logics into smaller scenarios. For example, if you got a requirement to add tracking when user logs out, you may not pollute existing logout logics, and just create a separate scenario instead:

```ts title="Scenario handles tracking only"
const logout = action(async () => { /* Handle logout logics */ });

scenario(logout.events.fulfilled, () => {
  console.log('User logged out');
});
```

As an alternative approach, action may be empty and used just to trigger a scenario. For example, the above code could be done in the following way:

```ts title="Logout handled in scenario"
const logout = action();

const logoutScenario = scenario(logout.events.invoked, async () => {
  // Handle logout logics
});

scenario(logoutScenario.events.fulfilled, () => {
  console.log('User logged out');
});
```
