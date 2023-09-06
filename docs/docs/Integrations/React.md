# React

```bash title="Installation"
npm i awai-react
```

This library provides hooks for connecting Awai's state nodes with React components.

* `useSetState` - returns a `state.set` method (can be used directly).

* `useStateValue` - returns curent state value. It works with suspense and ensures that async node is loaded.

* `useState` - Returns a tuple `[useStateValue(state), useSetState(state)]`, just to be aligned with React's `useState` interface.

* `useAsyncStateValue` - this hook only works with `ReadableAsyncState` (eg. [AsyncState](/async-state)) and returns a result of `getAsync` method. Unlike `useStateValue`, this hook does not suspend. That means, that component is rendered even though state is not yet initialized, which results in `value` to be possibly `undefined`.
