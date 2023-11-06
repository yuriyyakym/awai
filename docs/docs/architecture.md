---
sidebar_position: 2
---

# Architecture

The architecture consists of the following main parts: [state](/state), [async-state](/async-state), [family-state](/family-state), [selector](/selector), [action](/action), [scenario](/scenario), [effect](/effect).

The library was written using a concept of a promise-like object which has no terminal state and may resolve multiple times. Let's call it [re-resolvable](/re-resolvable).

Such re-resolvable can be used instead of event emitters, and when you try to do so, you are naturally forced into a different way of writing application logics.

Every Awai node has `events` property, which is an object of AwaiEvents (re-resolvables). Those events may be used to control scenarios.

When writing code, consider splitting logics into smaller scenarios. For example, if you got a requirement to add tracking when user logs out, you may not pollute existing logout logics, and just create a separate scenario instead:

```ts title="Scenario handles tracking only"
const logout = action(async () => { /* ... */ });

scenario(logout.events.invoked, () => {
  console.log('User logged out');
});
```

Upon creation every Awai node is registered in [Registry](/registry). You may use the registry for writing common nodes functionality. For example, if you want to create a state persistance functionality you can assign a custom tag to a state node and use it when node is registered:

```ts
const PERSIST_TAG = 'persist';

const userProfile = asyncState(fetchUserProfile, {
  id: 'user-profile',
  tags: [PERSIST_TAG]
});

const userSettings = asyncState(fetchUserSettings, {
  id: 'user-settings',
  tags: [PERSIST_TAG]
});

scenario(
  registry.events.registered,
  (node) => {
    if (node.config.tags.includes(PERSIST_TAG)) {
      scenario(node.events.changed, (value) => {
        localStorage.setItem(node.config.id, JSON.stringify(value));
      });

      const persistedValue = localStorage.getItem(node.config.id);

      if (typeof persistedValue === 'string') {
        node.set(JSON.parse(persistedValue));
      }
    }
  }
);
```
