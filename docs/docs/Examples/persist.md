---
---

# Persist

Upon creation every Awai node is registered in [Registry](/registry). You may use the registry for writing common nodes functionality. For example, if you want to do a state persistance functionality, you can assign a custom tag to a state node and use it when the node is registered:

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
