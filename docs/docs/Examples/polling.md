---
---

# Polling

In this example we will refetch user profile every `N` seconds, where `N` depends on connection type.

```ts title="Create entity polling effect - alternative approach"
const profileState = asyncState<UserProfile>(fetchUserProfile);

effect([isOnlineState, syncIntervalState], (isOnline, syncInterval) => {
  if (!isOnline) {
    return;
  }

  const refetchEntity = () => {
    const profilePromise = fetchUserProfile();
    profileState.set(profilePromise);
  };

  const intervalId = setInterval(refetchEntity, syncInterval);

  return () => {
    clearInterval(intervalId);
  };
});
```

```ts title="Create connectionEffectiveTypeState"
type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g';

const navigator = window.navigator as any;
const connection =
  navigator && (navigator.connection || navigator.mozConnection || navigator.webkitConnection);

const connectionEffectiveTypeState = state<EffectiveType>(connection.effectiveType);

connection.addEventListener('change', () => {
  connectionEffectiveTypeState.set(connection.effectiveType);
});
```

```ts title="Create isOnlineState"
const isOnlineState = state<boolean>(navigator.onLine);

scenarioOnce(async () => {
  window.addEventListener('online', () => isOnlineState.set(true), { passive: true });
  window.addEventListener('offline', () => isOnlineState.set(false), { passive: true });

  if (connection) {
    connection.addEventListener('change', () => {
      isOnlineState.set(navigator.onLine);
    });
  }
});
```

```ts title="Create sync interval state"
const syncIntervalState = selector(
  [connectionEffectiveTypeState],
  (connectionType) => {
    switch (connectionType) {
      case 'slow-2g':
        return 20000;
      case '2g':
        return 10000;
      case '3g':
        return 5000;
      default:
        return 3000;
    }
  },
);
```

```ts title="Utils"
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
```

:::note
Most likely, in the future there will be a library created with helpers like `connectionEffectiveTypeState` and `isOnlineState`.
:::
