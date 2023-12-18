---
sidebar_position: 102
slug: /examples
---

# Examples

## Paint

[Playground](https://codesandbox.io/p/github/yuriyyakym/awai-paint/master) | [Repository](https://github.com/yuriyyakym/awai-paint) | [Demo](https://awai-paint.vercel.app/)

_Complexity: Medium_

_Uses: [State](/state), [Action](/action), [Scenario](/scenario)_

This examples shows how to compose actions and scenarios, and also suggests unique architectural approach. It is also a proof that Awai works great with real-time logics.

## Todo list

[Playground](https://codesandbox.io/p/sandbox/awai--todo-list-wqyjfz?file=%2FREADME.md%3A3%2C23)

_Complexity: Simple_

_Uses: [State](/state), [Action](/action)_

Traditional Todo list example, which shows simple actions and state usage. In contrast to the Paint example, logics are handled inside of actions, not in scenarios, which is a good approach for simple projects.

## Safe counter

[Playground](https://codesandbox.io/p/sandbox/awai--cunter-qk7h6p?file=%2FREADME.md%3A3%2C23)

_Complexity: Simple_

_Uses: [State](/state), [Selector](/selector), [Action](/action), [Scenario](/scenario)_

Funny counter application, which prevents user from keeping counter below 0, by automatically incrementing counter every second. Project demonstrates scenarios composition and how additional logics may be handled outside of actions.

## User polling

[Playground](https://codesandbox.io/p/sandbox/awai--polling-63572c?file=%2FREADME.md%3A3%2C23)

_Complexity: Complex_

_Uses: [State](/state), [AsyncState](/async-state), [Action](/action), [Selector](/selector), [Scenario](/scenario), [Effect](/effect)_

Project that demonstrates how to perform user polling with different frequency depending on connection speed.
In order to test this example, open DevTools and throttle your network connection.

## Debounced counter

[Playground](https://codesandbox.io/p/sandbox/awai--debounce-tt97h5?file=%2FREADME.md%3A3%2C23)

_Complexity: Simple_

_Used nodes: [State](/state), [Action](/action), [Scenario](/scenario)_

Project that demonstrates how to implement debouncing using forked scenario.

## Throttled counter

[Playground](https://codesandbox.io/p/sandbox/awai--throttle-k38s9h?file=%2FREADME.md%3A3%2C23)

_Complexity: Simple_

_Used nodes: [State](/state), [Action](/action), [Scenario](/scenario)_

---

Project that demonstrates how to use cyclic scenario for implementing throttling functionality.

## Persist state

[Playground](https://codesandbox.io/p/sandbox/awai--persist-2kfnxp?file=%2FREADME.md%3A3%2C23)

_Complexity: Simple_

_Used nodes: [State](/state), [Scenario](/scenario), [Registry](/registry)_

---

Project that demonstrates how to persist state in localStorage, and implement shared Awai nodes functionality using [Registry](/registry).

## Universities search

[Playground](https://codesandbox.io/p/sandbox/awai--universities-search-9n9c5k?file=%2FREADME.md%3A3%2C23)

_Complexity: Complex_

_Used nodes: [State](/state), [AsyncState](/async-state), [Action](/action), [Selector](/selector), [Scenario](/scenario)_

---

Project that demonstrates how to implement debounced search with sorting.
It shows advanced Scenario and AsyncSelector usage. It also features error and loading states handling.
