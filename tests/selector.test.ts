import { expect, test } from 'vitest';

import { SystemTag, asyncState, delay, familyState, selector, state } from '../src';

test('composes sync states properly', async () => {
  const state1 = state<number>(1);
  const state2 = state<number>(2);
  const state3 = state<number>(3);

  const stateSum = selector([state1, state2, state3], (a, b, c) => a + b + c);

  expect(stateSum.get()).toEqual(6);
});

test('only calls callback when all async dependencies are resolved', async () => {
  const state = asyncState(delay(10).then(() => 'test'));
  const duplicatedState = selector([state], (state) => {
    expect(state).toBe('test');
    return state!.repeat(2);
  });
  expect(await duplicatedState.getPromise()).toBe('testtest');
});

test('Emits `changed` event properly', async () => {
  const state1 = state<number>(1);
  const state2 = asyncState<number>(delay(10).then(() => 2));
  const state3 = state<number>(3);

  const stateSum = selector([state1, state2, state3], (a, b, c) => a + b + c);

  expect(await stateSum.events.changed).toEqual(6);
  expect(stateSum.get()).toEqual(6);
});

test('handles async predicate', async () => {
  const state1 = state<number>(1);
  const state2 = familyState(async (id) => delay(10).then(() => Number(id) * 2));

  const stateSum = selector([state1, state2], async (a) => {
    await delay(10);
    return state2.getNode(String(a));
  });

  expect(stateSum.getAsync().isLoading).toEqual(true);
  expect(await stateSum.events.changed).toEqual(2);
  expect(stateSum.getAsync().isLoading).toEqual(false);
  expect(stateSum.getAsync().error).toEqual(undefined);

  state1.set(10);
  await stateSum.events.changed;
  expect(stateSum.get()).toEqual(20);
});

test('automatically assigns id when not provided', () => {
  expect(selector([], () => undefined).config.id).not.toBeUndefined();
});

test('applies custom config to sync selector', () => {
  const { config } = selector([], () => undefined, {
    id: 'selector-id',
    tags: ['awai', 'selector-test'],
  });

  expect(config.id).toBe('selector-id');
  expect(config.tags).toEqual(['selector', 'awai', 'selector-test']);
  expect(config.tags).toContain(SystemTag.SELECTOR);
});

test('applies custom config to async selector', () => {
  const { config } = selector([asyncState(Promise.resolve('test'))], () => undefined, {
    id: 'async-selector-id',
    tags: ['awai', 'async-selector-test'],
  });

  expect(config.id).toBe('async-selector-id');
  expect(config.tags).toEqual(['async-selector', 'awai', 'async-selector-test']);
  expect(config.tags).toContain(SystemTag.ASYNC_SELECTOR);
});
