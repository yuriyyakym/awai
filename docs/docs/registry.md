---
sidebar_position: 101
slug: /registry
---

# Registry

Registry is used internally for Awai events orchestration.

Upon creation every Awai node is registered in registry. You may use the registry events for writing common nodes middleware-like functionality. For example, if you want to log some state changes to console, you can do it like this:

```ts
import { registry } from 'awai';

const LOG_TAG = 'persist';

const counter1 = state(0, { id: 'counter-1', tags: [LOG_TAG] });
const counter2 = state(0, { id: 'counter-2', tags: [LOG_TAG] });

scenario(
  registry.events.registered,
  (node) => {
    if (node.config.tags.includes(LOG_TAG)) {
      scenario(node.events.changed, (value) => {
        console.log(`${node.config.id} got a new value: ${value}`);
      });
    }
  }
);
```
