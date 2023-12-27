<div align="center">
  <h1 align="center">Awai</h1>

  <img width="64px" src="https://github.com/yuriyyakym/awai/blob/master/logo.svg" />

  <p style="margin-right: -20px;">Dependency-free state management library</p>

  <div>
    <img src="https://github.com/yuriyyakym/awai/actions/workflows/tests.yml/badge.svg" />
    <img src="https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/yuriyyakym/ba8810278ef57a8ae9243e3edf9f43b8/raw/coverage-master.json" />
    <img src="https://img.shields.io/badge/Stability-experimental-blue.svg" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" />
  </div>

  <br />
  
  <p>| <a href="https://awai.js.org">Documentation</a> | <a href="https://awai.js.org/examples">Examples</a> | <a href="https://www.npmjs.com/package/awai">NPM</a> | <a href="https://github.com/yuriyyakym/awai-react">Awai-React</a> |</p>
</div>

---

## About

This library suggests an [architectural approach](https://awai.js.org/architecture), where every event is a promise-like (thennable) [AwaiEvent](https://awai.js.org/awai-event) with no terminal state.

AwaiEvent is a fundamental part of this library. It can re-resolve infinite amount of times, and if you await it in a loop, you have an event listener replacement.

Awai provides variety of nodes which were design to help with handling complex logics.
Every Awai node has its events, which can be mixed into any async logics, or used as trigger for [Scenarios](https://awai.js.org/scenario).

[Scenario](/scenario) is a powerful helper which helps to describe complex logics and events sequences using async functions.

Awai helps with organizing asynchronous logics and handling race conditions with ease, and its main goal is to completely extract business logics from UI layer.

## Installation

```sh
npm install awai
```

## Documentation

- [Quick start](https://awai.js.org/quick-start)
- [Motivation](https://awai.js.org/motivation)
- [Architecture](https://awai.js.org/architecture)
- [Examples](https://awai.js.org/examples)
- Awai nodes: [State](https://awai.js.org/state), [AsyncState](https://awai.js.org/async-state), [Selector](https://awai.js.org/selector), [Action](https://awai.js.org/action), [Scenario](https://awai.js.org/scenario), [FamilyState](https://awai.js.org/family-state), [Effect](https://awai.js.org/effect)
- Other
  - [AwaiEvent](https://awai.js.org/awai-event)
  - [Registry](https://awai.js.org/registry)

## Integrations

- **React** - [NPM](https://www.npmjs.com/package/awai-react), [Repository](https://github.com/yuriyyakym/awai-react)
