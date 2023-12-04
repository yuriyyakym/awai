import { expect, test } from 'vitest';

import { asyncState, AsyncStatus, delay, SystemTag } from '../src';

test('resolves immediately if non-async value is set', async () => {
  const greeting = asyncState<string>('Async state');
  expect(greeting.get()).toBe('Async state');
});

test('`requested` event is not emited when non-async initial value is set', async () => {
  const fruit = asyncState<string>('apple');
  const value = await Promise.race([
    fruit.events.requested.then(() => 'emited'),
    delay(10).then(() => 'not emited'),
  ]);
  expect(value).toBe('not emited');
});

test('`requested` event is not emited when non-async initial value is set', async () => {
  const fruit = asyncState<string>('apple');
  const value = await Promise.race([
    fruit.events.requested.then(() => 'emited'),
    delay(10).then(() => 'not emited'),
  ]);
  expect(value).toBe('not emited');
});

test('emits `requested`, `fulfilled` and `changed` events in proper order', async () => {
  const greeting = asyncState<string>();

  setTimeout(greeting.set, 10, Promise.resolve('Magic message'));

  expect(greeting.get()).toBe(undefined);
  const [fullfilledValue, changedValue] = await Promise.all([
    greeting.events.fulfilled,
    greeting.events.changed,
  ]);
  expect(fullfilledValue).toBe('Magic message');
  expect(changedValue).toBe('Magic message');
  expect(greeting.get()).toBe('Magic message');
});

test('ignores resolved initial value if custom value was already set', async () => {
  const state = asyncState(delay(5).then(() => 'a'));
  state.set(Promise.resolve('b'));
  await delay(10);
  expect(state.get()).toBe('b');
});

test('ignores previous resolved promises if newer promise was set', async () => {
  const state = asyncState(delay(5).then(() => 1));
  state.set(delay(5).then(() => 2));
  state.set(delay(10).then(() => 3));
  state.set(delay(15).then(() => 4));
  expect(state.get()).toBeUndefined();
  const value = await state.events.changed;
  expect(value).toBe(4);
  expect(state.get()).toBe(4);
});

test('ignores previous rejected promises if newer promise was set', async () => {
  const state = asyncState(delay(3).then(() => 1));
  state.set(delay(5).then(() => 2));
  state.set(delay(15).then(() => Promise.reject(3)));
  state.set(delay(10).then(() => 4));
  await state.events.changed;
  expect(state.events.ignored).resolves.toEqual({ error: 3, version: 3 });
  expect(state.get()).toBe(4);
});

test('emits `ignored` event if outdated version promise is settled', async () => {
  const state = asyncState(delay(5).then(() => 'a'));
  state.set(delay(5).then(() => 'b'));
  state.set(delay(10).then(() => 'c'));
  state.set(delay(20).then(() => Promise.reject('d')));
  state.set(delay(10).then(() => 'e'));
  expect(state.get()).toBeUndefined();
  expect(await state.events.ignored).toStrictEqual({ version: 1, value: 'a' });
  expect(await state.events.ignored).toStrictEqual({ version: 2, value: 'b' });
  expect(await state.events.ignored).toStrictEqual({ version: 3, value: 'c' });
  expect(await state.events.ignored).toStrictEqual({ version: 4, error: 'd' });
  expect(state.get()).toBe('e');
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

test('`getPromise` resolves immediately if sync initial value is set', () => {
  const state = asyncState('Awai');
  expect(state.getStatus()).toBe(AsyncStatus.FULFILLED);
  expect(state.getPromise()).resolves.toEqual('Awai');
});

test('`getPromise` resolves when async initial value is set', () => {
  const state = asyncState(delay(10).then(() => 'Awai'));
  expect(state.get()).toBeUndefined();
  expect(state.getStatus()).toBe(AsyncStatus.PENDING);
  expect(state.getPromise()).resolves.toEqual('Awai');
});

test('`getPromise` rejects if initial value callback throws', () => {
  const state = asyncState(() => {
    throw 'Awai';
  });
  expect(state.getStatus()).toBe(AsyncStatus.REJECTED);
  expect(state.get()).toBeUndefined();
  expect(state.getPromise()).resolves.toEqual(undefined);
  expect(state.getAsync().error).toEqual('Awai');
});

test('applies custom config', () => {
  const { config } = asyncState(undefined, { id: 'test', tags: ['awai'] });

  expect(config.id).toBe('test');
  expect(config.tags).toContain('awai');
  expect(config.tags).toContain(SystemTag.ASYNC_STATE);
});

test('is thennable', () => {
  const state = asyncState('Awai');
  expect(state.then()).resolves.toEqual('Awai');
  expect(state.then((name) => name.repeat(2))).resolves.toEqual('AwaiAwai');
});

test('`getAsync` returns proper async value', async () => {
  const state = asyncState();
  expect(state.getAsync()).toStrictEqual({
    value: undefined,
    error: null,
    isLoading: false,
  });
  state.set(delay(10).then(() => 'Awai'));
  expect(state.getAsync()).toStrictEqual({
    value: undefined,
    error: null,
    isLoading: true,
  });
  await delay(15);
  expect(state.getAsync()).toStrictEqual({
    value: 'Awai',
    error: null,
    isLoading: false,
  });
  state.set(delay(5).then(() => Promise.reject('Awai')));
  expect(state.getAsync()).toStrictEqual({
    value: 'Awai',
    error: null,
    isLoading: true,
  });
  await state.events.rejected;
  expect(state.getAsync()).toStrictEqual({
    value: undefined,
    error: 'Awai',
    isLoading: false,
  });
});
