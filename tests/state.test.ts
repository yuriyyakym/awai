import { expect, test, vi } from 'vitest';

import { SystemTag, flush, scenario, state } from '../src';

test('is updated asynchronously', async () => {
  const greeting = state<string>('Hi');

  await greeting.set('Hello');
  expect(greeting.get()).toEqual('Hello');
});

test('has `changed` AwaitableEvent event', async () => {
  const greeting = state<string>('Hello');
  expect(greeting).toHaveProperty('events');
  expect(greeting.events).toHaveProperty('changed');
  expect(greeting.events.changed).resolves.toEqual('Hello there');
  greeting.set('Hello there');
});

test('is Promise-like and resolves with current value', async () => {
  const greeting = state<string>('Hello');
  await greeting.set('Hello there');
  expect(await greeting).toEqual('Hello there');
});

test('awaits for the right event', async () => {
  const CODE = 1234;
  const pin = state(CODE);

  const correctPinPromise = pin.events.changed.filter((newPin) => newPin === CODE);

  queueMicrotask(async () => {
    await pin.set(4321);
    await pin.set(1111);
    await pin.set(CODE);
    await pin.set(2222);
  });

  await expect(correctPinPromise).resolves.toBe(CODE);
});

test('accepts setter function with current value as an argument', async () => {
  const greeting = state<string>('Hello');
  greeting.set((current) => current + ' World!');
  expect(greeting.get()).toBe('Hello World!');
});

test('same state resolves twice', async () => {
  const counter = state(0);

  setTimeout(counter.set, 100, 1);
  setTimeout(counter.set, 200, 2);

  const value1 = await counter.events.changed;
  const value2 = await counter.events.changed;

  expect(value1).toBe(1);
  expect(value2).toBe(2);
});

test('should not emit if same value set', async () => {
  const counter = state(0);
  const resolve = vi.fn<[number]>();

  counter.events.changed.then(resolve);
  await counter.set(0);

  expect(resolve).not.toBeCalled();
});

test('should catch fast state changes', async () => {
  const counter = state(-1);
  const values: number[] = [];
  const expectedValues: number[] = [];

  scenario(counter.events.changed, (value) => {
    values.push(value);
  });

  for (let i = 0; i < 10; i++) {
    expectedValues.push(i);
    counter.set(i);
  }

  await flush();

  expect(values).toEqual(expectedValues);
});

test('automatically assigns id when not provided', () => {
  expect(state(() => undefined).config.id).not.toBeUndefined();
});

test('applies custom config to sync selector', () => {
  const { config } = state(() => undefined, {
    id: 'state-test-id',
    tags: ['awai', 'state-test'],
  });

  expect(config.id).toBe('state-test-id');
  expect(config.tags).toEqual([SystemTag.STATE, 'awai', 'state-test']);
});
