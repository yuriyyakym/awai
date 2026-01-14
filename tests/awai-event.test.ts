import { expect, test, vi } from 'vitest';

import { AwaiEvent, delay } from '../src';

test('registers awaiter and resolves it when emitted', () => {
  const event = new AwaiEvent<string>();
  expect(event).resolves.toBe('Awai');
  event.emit('Awai');
});

test('is thennable', () => {
  const event = new AwaiEvent<string>();
  expect(event.then()).resolves.toEqual('Awai');
  expect(event.then((name) => name.repeat(2))).resolves.toEqual('AwaiAwai');
  event.emit('Awai');
});

test('registers multiple awaiters and resolves them when emitted', async () => {
  const event = new AwaiEvent<string>();
  expect(event).resolves.toBe('Awai');
  expect(event).resolves.toBe('Awai');
  expect(Promise.resolve(event)).resolves.toBe('Awai');
  expect(Promise.all([event, Promise.resolve(event)])).resolves.toEqual(['Awai', 'Awai']);
  setTimeout(() => event.emit('Awai'), 0);
});

test('handles re-subscriptions and emits new values', async () => {
  const event = new AwaiEvent<string>();
  setTimeout(() => event.emit('Awai'), 0);
  await expect(event).resolves.toBe('Awai');
  setTimeout(() => event.emit('Hello Awai'), 0);
  await expect(event).resolves.toBe('Hello Awai');
});

test('returns promise even if no callback is passed to `then` method', async () => {
  const event = new AwaiEvent<string>();
  expect(event.then()).resolves.toBe('Awai');
  event.emit('Awai');
});

test('rejects when aborted', async () => {
  const event = new AwaiEvent<string>();
  const abortController = new AbortController();
  expect(event.abortable(abortController.signal)).rejects.toBe('Aborted');
  await delay(0);
  abortController.abort();
});

test('removes callback from awaiters when aborted', async () => {
  const resolve = vi.fn();
  const reject = vi.fn();
  const event = new AwaiEvent();
  const abortController = new AbortController();
  event.then(resolve);
  event.abortable(abortController.signal).catch(reject);
  abortController.abort();
  event.emit();
  await delay(0);
  expect(resolve).toBeCalled();
  expect(reject).toBeCalled();
});

test('rejects when callback throws', async () => {
  const event = new AwaiEvent();

  const promise = event.then(() => {
    throw 'Some error';
  });
  const wrappedPromise = Promise.resolve(promise);

  expect(promise).rejects.toBe('Some error');
  expect(wrappedPromise).rejects.toBe('Some error');

  event.emit();
});

test('rejects when callback returns rejected promise', async () => {
  const event = new AwaiEvent();

  const promise = event.then(() => Promise.reject('Some error'));
  const wrappedPromise = Promise.resolve(promise);

  expect(promise).rejects.toBe('Some error');
  expect(wrappedPromise).rejects.toBe('Some error');

  event.emit();
});

test('filters out non-applicable events', async () => {
  const number = new AwaiEvent<number>();
  const awaitedNumber = 2;

  queueMicrotask(async () => {
    await number.emit(1);
    await number.emit(2);
    await number.emit(3);
  });

  const numberPromise = number.filter((n) => n === awaitedNumber);
  expect(numberPromise).resolves.toBe(awaitedNumber);
});
