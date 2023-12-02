import { expect, test } from 'vitest';

import { action } from '../src';

test('emits invoked event when called', async () => {
  const greet = action();
  expect(greet.events.invoked).resolves.toStrictEqual({
    arguments: [],
    config: greet.config,
  });
  greet();
});

test('passes arguments to a callback and emits them in `invoked` event payload', async () => {
  const greet = action((name) => `Hello ${name}`);

  expect(greet.events.invoked).resolves.toStrictEqual({
    arguments: ['Awai'],
    config: greet.config,
  });

  greet('Awai');
});

test('returns Promise of a value returned by callback', async () => {
  const greet = action((name) => `Hello ${name}`);
  const result = greet('Awai');
  expect(result).toBeInstanceOf(Promise);
  expect(result).resolves.toEqual('Hello Awai');
});

test('emits result of callback in `resolved` event payload', async () => {
  const greet = action((name) => `Hello ${name}`);

  expect(greet.events.resolved).resolves.toStrictEqual({
    arguments: ['Awai'],
    result: 'Hello Awai',
    config: greet.config,
  });

  greet('Awai');
});

test('rejects if callback rejects', async () => {
  const greet = action((name) => {
    throw name;
  });

  expect(() => greet('Awai')).rejects.toEqual('Awai');
});

test('emits rejection reason in `rejected` event', async () => {
  const greet = action((name) => {
    throw `Hello ${name}`;
  });

  expect(greet.events.rejected).resolves.toStrictEqual({
    arguments: ['Awai'],
    error: 'Hello Awai',
    config: greet.config,
  });

  expect(() => greet('Awai')).rejects.toEqual('Hello Awai');
});
