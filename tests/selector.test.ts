import { expect, test, vi } from 'vitest';

import {
  AsyncStatus,
  SystemTag,
  asyncState,
  delay,
  familyState,
  flush,
  scenario,
  selector,
  state,
} from '../src';

test('composes sync states', async () => {
  const state1 = state<number>(1);
  const state2 = state<number>(2);
  const state3 = state<number>(3);

  const stateSum = selector([state1, state2, state3], (a, b, c) => a + b + c);

  expect(stateSum.get()).toEqual(6);
});

test('only calls callback when all async dependencies are fullfilled', async () => {
  const greetingState = asyncState(delay(10).then(() => 'Hello'));
  const nameState = asyncState(delay(20).then(() => 'Awai'));
  const mergedState = selector([greetingState, nameState], (greeting, name) => {
    expect(greeting).toBe('Hello');
    expect(name).toBe('Awai');
    return `${greeting} ${name}`;
  });
  expect(mergedState.get()).toBeUndefined();
  expect(mergedState.getStatus()).toBe(AsyncStatus.PENDING);
  expect(await mergedState.getPromise()).toBe('Hello Awai');
  expect(mergedState.getStatus()).toBe(AsyncStatus.FULFILLED);
});

test('emits `changed` event properly', async () => {
  const state1 = state<number>(1);
  const state2 = asyncState<number>(delay(10).then(() => 2));
  const state3 = state<number>(3);

  const stateSum = selector([state1, state2, state3], (a, b, c) => a + b + c);

  expect(stateSum.get()).toEqual(undefined);
  expect(await stateSum.events.changed).toEqual(6);
  expect(stateSum.get()).toEqual(6);
});

test('does not emit `changed` event if callback returns same value (sync)', async () => {
  const onChange = vi.fn();
  const counterState = state<number>(0);
  const isNegativeCounter = selector([counterState], (counter) => counter < 0);

  scenario(isNegativeCounter.events.changed, onChange);

  expect(isNegativeCounter.get()).toEqual(false);
  await counterState.set(-1);
  expect(onChange).toBeCalledTimes(1);
  expect(isNegativeCounter.get()).toEqual(true);
  await counterState.set(-2);
  expect(onChange).toBeCalledTimes(1);
  expect(isNegativeCounter.get()).toEqual(true);
  await counterState.set(1);
  expect(onChange).toBeCalledTimes(2);
  expect(isNegativeCounter.get()).toEqual(false);
});

test('does not emit `changed` event if callback returns same value (async)', async () => {
  const onChange = vi.fn();
  const counterState = state<number>(0);
  const isNegativeCounter = selector([counterState], async (counter) => {
    if (Object.is(counter, -Infinity) || Object.is(counter, Infinity)) {
      throw new Error('Cannot count that far');
    }

    return counter < 0;
  });

  scenario(isNegativeCounter.events.changed, onChange);

  await flush();
  expect(onChange).toBeCalledTimes(1);
  expect(isNegativeCounter.get()).toEqual(false);

  counterState.set(-1);
  await flush();
  expect(onChange).toBeCalledTimes(2);
  expect(isNegativeCounter.get()).toEqual(true);

  counterState.set(-2);
  await flush();
  expect(onChange).toBeCalledTimes(2);
  expect(isNegativeCounter.get()).toEqual(true);

  await counterState.set(1);
  await flush();
  expect(onChange).toBeCalledTimes(3);
  expect(isNegativeCounter.get()).toEqual(false);

  await counterState.set(-Infinity);
  await flush();
  expect(onChange).toBeCalledTimes(4);
  expect(isNegativeCounter.get()).toEqual(undefined);
  expect(isNegativeCounter.getStatus()).toEqual(AsyncStatus.REJECTED);

  await counterState.set(Infinity);
  await flush();
  expect(onChange).toBeCalledTimes(4);
  expect(isNegativeCounter.get()).toEqual(undefined);
  expect(isNegativeCounter.getStatus()).toEqual(AsyncStatus.REJECTED);
});

test('emits error when one of dependencies states failed', async () => {
  const greetingState = state('Hello');
  const nameState = asyncState<number>(delay(10).then(() => Promise.reject('Awai')));
  const mergedState = selector(
    [greetingState, nameState],
    (greeting, name) => `${greeting} ${name}`,
  );

  expect(mergedState.get()).toEqual(undefined);
  const error = await mergedState.events.rejected;
  expect(error).toBeInstanceOf(AggregateError);
  expect((error as AggregateError).errors).toEqual(['Awai']);
});

test('emits error every time async dependency fails', async () => {
  const reject = vi.fn();
  const greetingState = asyncState('');
  const nameState = asyncState();
  const mergedState = selector(
    [greetingState, nameState],
    (greeting, name) => `${greeting} ${name}`,
  );
  scenario(mergedState.events.rejected, reject);

  greetingState.set(delay(5).then(() => Promise.reject('Hey')));
  nameState.set(delay(15).then(() => Promise.reject('Awai')));

  expect(reject).not.toBeCalled();
  await delay(10);
  expect(reject).toBeCalledTimes(1);
  expect(reject).toBeCalledWith(new AggregateError(['Hey']));
  await delay(20);
  const finalError = new AggregateError(['Hey', 'Awai']);
  expect(reject).toBeCalledTimes(2);
  expect(reject).toBeCalledWith(finalError);
  expect(mergedState.getAsync()).toStrictEqual({
    value: undefined,
    error: finalError,
    isLoading: false,
  });
});

test('emits error when callback throws', async () => {
  const messageState = asyncState(delay(5).then(() => 'Hello Awai'));
  const mergedState = selector([messageState], (message): string => {
    throw new Error('Simple Error');
  });

  const error = await mergedState.events.rejected;
  expect(error).not.toBeInstanceOf(AggregateError);
  expect(error).toBeInstanceOf(Error);
  expect(error).toEqual(new Error('Simple Error'));
});

test('emits `requested` event when one of async dependencies is requested', async () => {
  const greetingState = state('Hello');
  const nameState = asyncState('Noname');

  const mergedState = selector(
    [greetingState, nameState],
    (greeting, name) => `${greeting} ${name}`,
  );

  expect(mergedState.get()).toEqual(undefined);
  await flush();
  expect(mergedState.get()).toEqual('Hello Noname');

  setTimeout(() => {
    nameState.set(delay(10).then(() => 'Awai'));
  }, 10);

  expect(mergedState.events.requested).resolves.toBeUndefined();
  expect(mergedState.events.fulfilled).resolves.toEqual('Hello Awai');
  expect(mergedState.events.changed).resolves.toEqual('Hello Awai');
});

test('`requested` event should only be emitted one time before fulfillment', async () => {
  const tick = vi.fn();
  const greetingState = asyncState(delay(2).then(() => 'Hello'));
  const nameState = asyncState(delay(20).then(() => 'Noname'));
  const mergedState = selector(
    [greetingState, nameState],
    (greeting, name) => `${greeting} ${name}`,
  );
  scenario(mergedState.events.requested, tick);
  delay(5).then(() => {
    greetingState.set(delay(10).then(() => 'Hey'));
  });
  expect(tick).toBeCalledTimes(0);
  await delay(0);
  expect(tick).toBeCalledTimes(1);
  await delay(20);
  expect(tick).toBeCalledTimes(1);
  delay(5).then(() => {
    greetingState.set(delay(5).then(() => 'Hey'));
  });
  delay(10).then(() => {
    nameState.set(delay(5).then(() => 'Awai'));
  });
  await delay(15);
  expect(tick).toBeCalledTimes(2);
});

test('ignores error if outdated promise is rejected', async () => {
  let callNumber = 0;
  const greetingState = state('Hello');
  const nameState = asyncState('Noname');

  const mergedState = selector([greetingState, nameState], async (greeting, name) => {
    callNumber++;
    if (callNumber === 1) {
      await delay(10);
      throw new Error('Random error');
    }
    return `${greeting} ${name}`;
  });

  setTimeout(nameState.set, 5, 'Awai');
  expect(mergedState.getPromise()).resolves.toEqual('Hello Noname');
  expect(mergedState.events.ignored).resolves.toStrictEqual({
    error: new Error('Random error'),
    version: 1,
  });
  expect(
    Promise.race([mergedState.events.rejected, delay(20).then(() => 'Not rejected')]),
  ).resolves.toEqual('Not rejected');
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
  expect(stateSum.getAsync().error).toEqual(null);

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
  expect(config.tags).toEqual([SystemTag.SELECTOR, 'awai', 'selector-test']);
});

test('applies custom config to async selector', () => {
  const { config } = selector([asyncState(Promise.resolve('test'))], () => undefined, {
    id: 'async-selector-id',
    tags: ['awai', 'async-selector-test'],
  });

  expect(config.id).toBe('async-selector-id');
  expect(config.tags).toEqual([SystemTag.ASYNC_SELECTOR, 'awai', 'async-selector-test']);
});

test('asyncSelector is thennable', () => {
  const asyncSelector = selector([asyncState(Promise.resolve('test'))], (a) => a);
  expect(asyncSelector.then()).resolves.toEqual('test');
  expect(asyncSelector.then((name) => name.repeat(2))).resolves.toEqual('testtest');
});

test('syncSelector is thennable', () => {
  const syncSelector = selector([state('Awai')], (name) => name);
  expect(syncSelector.then()).resolves.toEqual('Awai');
  expect(syncSelector.then((name) => name.repeat(2))).resolves.toEqual('AwaiAwai');
});

test('allows passing custom properties in config for sync state', () => {
  const { config } = selector([state('Awai')], (name) => name, { lib: 'Awai' });
  expect(config).toMatchObject({ lib: 'Awai' });
});

test('allows passing custom properties in config for async state', () => {
  const { config } = selector([asyncState('Awai')], (name) => name, { lib: 'Awai' });
  expect(config).toMatchObject({ lib: 'Awai' });
});
