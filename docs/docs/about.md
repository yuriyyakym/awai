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
  
  <p>| <a href="https://github.com/yuriyyakym/awai">GitHub</a> | <a href="https://github.com/yuriyyakym/awai-react">Awai-React</a> |</p>
</div>

---

This library suggests an [architectural approach](/architecture), where every event is a promise-like [AwaiEvent](/awai-event) with no terminal state.

AwaiEvent is a fundamental part of this library. It can re-resolve infinite amount of times, and if you await this event in a loop, you have an event listener replacement.

Every Awai node has its events, which can be mixed into any async logics, or used as trigger for [Scenarios](https://awai.js.org/scenario).

Awai helps with organizing asynchronous logics and handling race conditions with ease.

[Scenarios](/scenario) helps to describe logics in saga-like way, using promises or AwaiEvents.

```bash title="Installation"
npm install awai
```

### Integrations

- **React** - [NPM](https://www.npmjs.com/package/awai-react), [GitHub](https://github.com/yuriyyakym/awai-react)

### Name meaning

The name comes from a Thai phrase [เอาไว้](https://www.thai2english.com/dictionary/1457374.html) which means "to keep/save/store for later".
