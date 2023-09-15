import { expect, test } from 'vitest';

import { asyncState, delay, SystemTag } from '../src';

test('resolves immediately if non-async value is set', async () => {
  const greeting = asyncState<string>('Async state');
  expect(greeting.get()).toBe('Async state');
});

test('`requested` event is not emited when raw value is non-async value is set', async () => {
  const fruit = asyncState<string>('apple');
  const value = await Promise.race([
    fruit.events.requested.then(() => 'emited'),
    delay(10).then(() => 'not emited'),
  ]);
  expect(value).toBe('not emited');
});

test('emits `requested` and `loaded` events in proper order', async () => {
  const greeting = asyncState<string>();

  setTimeout(greeting.set, 10, Promise.resolve('Magic message'));

  expect(greeting.get()).toBe(undefined);
  const value = await greeting.events.changed;
  expect(value).toBe('Magic message');
});

test('ignores resolved initial value if custom value was already set', async () => {
  const state = asyncState(delay(10).then(() => 'a'));
  state.set(Promise.resolve('b'));
  await delay(10);
  expect(state.get()).toBe('b');
});

test('creates async composed state with any initial value', async () => {
  const state1 = asyncState(1);
  const state2 = asyncState(Promise.resolve(2));
  const state3 = asyncState(() => 3);
  const state4 = asyncState(() => Promise.resolve(4));
  const state5 = asyncState(delay(10).then(() => 5));

  expect(state1.get()).toBe(1);
  expect(state2.get()).toBe(undefined);
  expect(await state2).toBe(2);
  expect(state3.get()).toBe(3);
  expect(state4.get()).toBe(4);
  expect(state5.get()).toBe(undefined);
  expect(await state5.getPromise()).toBe(5);
});

test('automatically assigns id when not provided', () => {
  expect(asyncState().config.id).not.toBeUndefined();
});

test('applies custom config', () => {
  const { config } = asyncState(undefined, { id: 'test', tags: ['awai'] });

  expect(config.id).toBe('test');
  expect(config.tags).toContain('awai');
  expect(config.tags).toContain(SystemTag.ASYNC_STATE);
});
