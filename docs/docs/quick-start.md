---
sidebar_position: 1
slug: /quick-start

---

# Quick start

Let's write some basic logics using Awai, every front-end developer faces every day.
Our task is to implement users list app with following functionaly:
- users list
- user details view
- user refetching every 3 seconds
- tracking

We will use some random public [mock API](https://jsonplaceholder.typicode.com). Let's assume we have `fetchUsers` and `fetchUser` functions already implemented.

You can see the complete working example at [playground](https://codesandbox.io/p/sandbox/awai--users-list-82pdm7).

:::note
In order to use full potential of Awai you should feel comfortable using [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
:::

### Installing dependencies

```bash
npm install awai awai-react
```

### Creating state

Awai provides two basic nodes for keeping a state - [State](/state) and [AsyncState](/async-state). We will need both of them. In State we will store currently viewed user id, whereas in AsyncState we will store all users list. Let's not worry about user details view yet.

```ts
const activeUserIdState = state(null);
const usersState = asyncState(fetchUsers);
```

When our app loads, we do not have any user selected, hence we store `null` in `activeUserIdState` initially.
As an initial value for `usersState` we used an async initializer function, which will be used immediately to load data from the API.

For getting state value use `get` method, like `usersState.get()`. Similarly, you need to use `set` method to set the value. For an AsyncState it is possible to set a Promise as a value, which will set state into a `pending` status. AsyncState can have one of three statuses: `pending`, `fulfilled` or `rejected`.
If you use `get` method on state being initialized, the return value is `undefined`.
If you want to be sure about asyncState value, you should use `getPromise` method.

:::info
If you would like to initialize users list state later, you can assign an empty array as an initial value, and set a users promise whenever data is needed.

```ts
const usersState = asyncState([]);

const loadUsers = action(() => {
  usersState.set(fetchUsers());
});
```
:::

### Family state

Now, let's create a state, where we will keep users' details. For that purpose Awai provides `familyState` node. That node is basically a record of `{ [id]: State }` or `{ [id]: AsyncState }`, depending on an initializer function return type. In our case it will be family of asyncStates, since all the data will be loaded from API asynchronously and our initializer returns a promise.

```ts
const usersDetailsFamilyState = familyState((id) => fetchUser(id));
```

At this moment nothing happens with our family state, unless we use `getNode(id)` method. This method will check if state for the requested ID exists in our family. If yes, it will return the state node, otherwise it will create a node using `fetchUser(id)` as an initial value.

### Action

For this example we only need `setActiveUserId` action. You may just set state directly using `activeUserIdState.set`, but recommended approach is to wrap it with `action` in order to get access to action events, which will be needed for triggering scenarios.

```ts
const setActiveUserId = action(id => activeUserIdState.set(id));
// const setActiveUserId = action(activeUserIdState.set);
```

### Effect

Effect is used for reacting to states changes and cleanup any effects. We will use it to refetch active user data every 3 seconds, according to our requirements.

```ts
effect([activeUserIdState], (activeUserId) => {
  if (activeUserId === null) {
    return;
  }

  const userDetailsStateNode = usersDetailsFamilyState.getNode(activeUserId);

  const intervalId = setInterval(() => {
    const userDetailsPromise = fetchUser(activeUserId);
    userDetailsStateNode.set(userDetailsPromise);
  }, 3000);

  return () => {
    clearInterval(intervalId);
  };
});
```

In this effect, if there is no selected user, we do not want to revalidate any data, so we just return.
Next we get active user details state node from family using its ID, and revalidate the user with 3s interval, setting it as a value promise.

:::info Race conditions
Notice that we set a promise, not a resolved value. This helps with race conditions since Awai will only take care of last set promise.
:::

### Selector

Selector is used for combining multiple states into some value. Resulting selector is async if any of dependencies is async. Selector is sync otherwise.

```ts
const activeUserDetailsState = selector(
  [activeUserIdState, usersDetailsFamilyState],
  async (activeUserId, _userDetailsFamily) => {
    if (activeUserId === null) {
      return null;
    }

    return usersDetailsFamilyState.getNode(activeUserId).getPromise();
  },
);
```

Now we have an async selector, which reacts to any changes in dependencies states and call our callback, passing it state values as arguments, in order to combine resulting value. In our case we pick userDetails state node from familyState by id and return it's promise, so that asyncSelector can handle it.
As you can see, we have ignored `_userDetailsFamily`, it is done for a safety reasons, since state with some id may still not be available in family, whereas `getNode(id)` assures its existence.

:::info Useful information
Notice, that even though all the dependencies are sync, you can still use an async combining callback, which will result in async selector:

```ts
selector(
  [syncState1, syncState2],
  async (value1, value2) => {
    delay(1000);
    return value1 + value 2;
  }
);
```
:::

### Tracking

For tracking it's best to use Scenarios, which are a handy tool to react to any AwaiEvents, promises or their combination. And helps to extract tracking/additional logics from business logics.

```ts
scenario(setActiveUserId.events.invoked, (id) => {
  console.log(`Open details for user with id ${id}`);
});

scenario(activeUserDetailsState.events.requested, (id) => {
  console.log(`Requesting newest details for active user`);
});

scenario(usersState.events.rejected, () => {
  console.error('Error while loading user');
});

scenario(activeUserDetailsState.events.rejected, () => {
  console.error('Error while loading user details');
});
```

:::info
Please note that this is a very primitive usage of Scenarios, as they are one of most powerful parts of Awai. See [Scenario](/scenario) docs in order to see different use cases.
:::

### React integration

This library provides hooks for connecting Awai's state nodes with React components.

- **useSetState** - returns a `state.set` method (can be used directly).

- **useStateValue** - returns curent state value. It works with suspense and ensures that async node is loaded.

- **useState** - Returns a tuple `[useStateValue(state), useSetState(state)]`, just to be aligned with React's `useState` interface.

- **useAsyncStateValue** - this hook only works with `ReadableAsyncState` (eg. [AsyncState](/async-state), or AsyncSelector) and returns a result of `getAsync` method. Unlike `useStateValue` this hook does not suspend. That means that component is rendered even though state is not yet initialized, which results in `value` to be possibly `undefined`.
