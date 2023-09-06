# Double click

First we wait for `click.events.invoked`, then we start scenario which begins with promises racing - if `click.events.invoked` is emitted again before `rejectAfter` is rejected, then `doubleClick` action is invoked.
If second promise is rejected before, current scenario execution is stopped and `doubleClick` action is not invoked.

```ts
const DOUBLE_CLICK_TIMEOUT = 200;

const click = action();
const doubleClick = action();

scenarioOnEvery(click.events.invoked, async () => {
  await Promise.race([click.events.invoked, rejectAfter(DOUBLE_CLICK_TIMEOUT)]);
  doubleClick();
});

scenarioOnEvery(doubleClick.events.invoked, async () => {
  console.log('Double click');
});
```

```ts title="Utils"
const rejectAfter = (ms: number): Promise<void> => {
  return new Promise((_, reject) => setTimeout(reject, ms));
};
```

:::warn
Notice, that second click starts new scenario as well, so that if user clicks three times in a row, `doubleClick` will be called twice.
:::
