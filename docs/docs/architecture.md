---
sidebar_position: 5
---

# Architecture

The architecture consists of three main parts: state, action and scenario.

The library was written using a concept of a promise-like object which has no terminal state and may resolve multiple times. Let's call it re-resolvable.

Such re-resolvable can be used instead of event emitters, and when you try to do so, you are naturally forced into a different way of writing algorithms.

### State

