import { expect, test, vi } from 'vitest';

import { SystemTag, flush, scenario, state } from '../src';

test('stored value is updated', async () => {
  const greeting = state<string>('Hi');
  await greeting.set('Hello');
  expect(greeting.get()).toEqual('Hello');
});

test('is thennable', async () => {
  const nameState = state('Awai');
  expect(nameState.then()).resolves.toEqual('Awai');
  expect(nameState.then((name) => name.repeat(2))).resolves.toEqual('AwaiAwai');
});

test('has `changed` AwaiEvent event', async () => {
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

test('accepts setter function with current value as an argument', async () => {
  const greeting = state<string>('Hello');
  greeting.set((current) => current + ' World!');
  expect(greeting.get()).toBe('Hello World!');
});

test('emits `changed` event', async () => {
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

test('uses custom compare to skip updates', async () => {
  const initial = { count: 1 };
  const counter = state(initial, {
    compare: (next, prev) => next.count === prev.count,
  });
  const onChange = vi.fn();

  scenario(counter.events.changed, onChange);

  await counter.set({ count: 1 });

  expect(onChange).not.toBeCalled();
  expect(counter.get()).toBe(initial);

  await counter.set({ count: 2 });

  expect(onChange).toBeCalledTimes(1);
  expect(counter.get()).toEqual({ count: 2 });
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

test('allows passing custom properties in config for async state', () => {
  const { config } = state('test', { lib: 'Awai' });
  expect(config).toMatchObject({ lib: 'Awai' });
});
