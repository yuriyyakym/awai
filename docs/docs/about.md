---
sidebar_position: 1
slug: /
title: Awai
sidebar_label: About
hide_title: true

---

<div align="center">
  <h1 align="center">Awai</h1>

  <img width="64px" style={{ padding: 0 }} src="logo.svg" />

  <p style={{ marginTop: '20px' }}>Dependency-free state management library</p>

  <div>
    <img src="https://github.com/yuriyyakym/awai/actions/workflows/tests.yml/badge.svg" />
    <img src="https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/yuriyyakym/ba8810278ef57a8ae9243e3edf9f43b8/raw/coverage-master.json" />
    <img src="https://img.shields.io/badge/Stability-experimental-blue.svg" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" />
  </div>

  <br />
  
  <p>| <a href="https://github.com/yuriyyakym/awai">GitHub</a> | <a href="/examples">Examples</a> | <a href="https://github.com/yuriyyakym/awai-react">Awai-React</a> |</p>
</div>

---

This library suggests an [architectural approach](/architecture), where every event is a promise-like (thennable) [AwaiEvent](/awai-event) with no terminal state.

AwaiEvent is a fundamental part of this library. It can re-resolve infinite amount of times, and if you await it in a loop, you have an event listener replacement.

Awai provides variety of nodes which were design to help with handling complex logics.
Every Awai node has its events, which can be mixed into any async logics, or used as trigger for [Scenarios](/scenario).

[Scenario](/scenario) is a powerful helper which helps to describe complex logics and events sequences using async functions.

Awai helps with organizing asynchronous logics and handling race conditions with ease, and it's main goal is to completely extract business logics from UI layer.

### Installation

```bash title="Installation"
npm install awai
```

### Integrations

- **React** - [GitHub](https://github.com/yuriyyakym/awai-react), [NPM](https://www.npmjs.com/package/awai-react)

### Basic example

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


<Tabs>

<TabItem value="js" label="JavaScript">

```ts title="Todo list state management"
import { action, state } from 'awai';
import { getUniqueId } from './utils';

export const tasksState = state([]);

export const createTask = action((title) => {
  tasksState.set((tasks) => [
    ...tasks,
    { id: getUniqueId(), isCompleted: false, title },
  ]);
});

export const deleteTask = action((id) => {
  tasksState.set((tasks) => tasks.filter((task) => task.id !== id));
});

export const toggleTaskIsCompleted = action((id) => {
  tasksState.set((tasks) => {
    return tasks.map((task) => {
      return task.id === id
        ? { ...task, isCompleted: !task.isCompleted }
        : task;
    });
  });
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="Todo list state management"
import { action, state } from 'awai';
import type { Task } from './types';
import { getUniqueId } from './utils';

export const tasksState = state<Task[]>([]);

export const createTask = action((title: Task['title']) => {
  tasksState.set((tasks) => [
    ...tasks,
    { id: getUniqueId(), isCompleted: false, title },
  ]);
});

export const deleteTask = action((id: Task['id']) => {
  tasksState.set((tasks) => tasks.filter((task) => task.id !== id));
});

export const toggleTaskIsCompleted = action((id: Task['id']) => {
  tasksState.set((tasks) => {
    return tasks.map((task) => {
      return task.id === id
        ? { ...task, isCompleted: !task.isCompleted }
        : task;
    });
  });
});
```

</TabItem>

</Tabs>

### Name meaning

The name comes from a Thai phrase [เอาไว้](https://www.thai2english.com/dictionary/1457374.html) which means "to keep/save/store for later".
