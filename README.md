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

## About

This library introduces a fresh approach to state management, where every event is a thennable (promise-like) with no terminal state.

Awai provides variety of tools helping with organizing asynchronous logic, handling race conditions, and prioritizes the extraction of business logic from the UI layer.

## Installation

```sh
npm install awai
```

## Available tools

- **State** - simple node which stores data
- **AsyncState** - helps with storing data loaded asynchronously protecting against race conditions
- **Selector** - combines multiple states (States/AsyncStates/Selectors) into a single value. Handles async loading and protects against race conditions
- **Scenario** - kind of event composable event listener, which allows to declaratively write logic in a saga-like way using async functions
- **Action** - function wrapper which emits events, and is helpful for triggering scenarios
- **FamilyState** - aggregator of multiple states of the same type; handles both sync and async states
- **Effect** - runs callback on dependency states change and cleans up previous effects

## Documentation

- [Quick start](https://awai.js.org/quick-start)
- [Architecture](https://awai.js.org/architecture)
- [Examples](https://awai.js.org/examples)
- Tools: [State](https://awai.js.org/state), [AsyncState](https://awai.js.org/async-state), [Selector](https://awai.js.org/selector), [Action](https://awai.js.org/action), [Scenario](https://awai.js.org/scenario), [FamilyState](https://awai.js.org/family-state), [Effect](https://awai.js.org/effect)
- Other
  - [AwaiEvent](https://awai.js.org/awai-event)
  - [Registry](https://awai.js.org/registry)
  - [Motivation](https://awai.js.org/motivation)

## Integrations

- **React** - [NPM](https://www.npmjs.com/package/awai-react), [GitHub](https://github.com/yuriyyakym/awai-react)
