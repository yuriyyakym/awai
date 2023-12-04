import { expect, test, vi } from 'vitest';

import { SystemTag, asyncState, delay, effect, flush, registry, scenario, state } from '../src';

test('runs effect immediately with sync states', async () => {
  const state1 = state<number>(1);
  const state2 = state<number>(2);

  const callback = vi.fn();

  effect([state1, state2], callback);

  await flush();

  expect(callback.mock.calls.length).toEqual(1);
});

test('does not run effect until all the states are fullfilled', async () => {
  const state1 = state<number>(1);
  const state2 = asyncState<number>(delay(20).then(() => 2));
  const callback = vi.fn();

  effect([state1, state2], callback);

  await delay(5);
  expect(callback).not.toBeCalled();
  await delay(20);
  expect(callback).toBeCalledTimes(1);
});

test('does not emit `cleared` event when no cleanup function returned', async () => {
  const state1 = state<number>(1);
  const state2 = state<number>(2);
  const onRun = vi.fn();
  const onCleanup = vi.fn();

  const testEffect = effect([state1, state2], () => undefined);

  scenario(testEffect.events.started, onRun);
  scenario(testEffect.events.cleared, onCleanup);

  await state1.set(0);
  await state1.set(1);
  await state2.set(1);

  expect(onRun.mock.calls.length).toEqual(4);
  expect(onCleanup.mock.calls.length).toEqual(0);
});

test('emits `cleared` event when cleanup function returned', async () => {
  const state1 = state<number>(1);
  const state2 = state<number>(2);
  const onRun = vi.fn();
  const onCleanup = vi.fn();

  const testEffect = effect([state1, state2], () => () => undefined);

  scenario(testEffect.events.started, onRun);
  scenario(testEffect.events.cleared, onCleanup);

  await state1.set(0);
  await state1.set(1);
  await state2.set(1);

  expect(onRun.mock.calls.length).toEqual(4);
  expect(onCleanup.mock.calls.length).toEqual(3);
});

test('runs effect and cleans it up in a correct order', async () => {
  const state1 = state<number>(1);
  const state2 = asyncState<number>(delay(10).then(() => 2));
  const history: ('run' | 'cleanup')[] = [];

  const callback = () => {
    history.push('run');
    return () => void history.push('cleanup');
  };

  effect([state1, state2], callback);

  await state2.set(3);
  await state2.set(4);
  await state2.set(5);

  expect(history).toEqual(['run', 'cleanup', 'run', 'cleanup', 'run', 'cleanup', 'run']);
});

test('registers effect before running', async () => {
  const state1 = state(1);
  const history: string[] = [];

  scenario(registry.events.registered, (node) => {
    if (node === testEffect) {
      scenario((node as typeof testEffect).events.started, () => {
        history.push('sub-scenario');
      });

      history.push('registration-scenario');
    }
  });

  const testEffect = effect([state1], () => {
    history.push('effect-callback');
  });

  await flush();

  expect(history).toEqual(['registration-scenario', 'effect-callback', 'sub-scenario']);

  await state1.set(2);

  expect(history).toEqual([
    'registration-scenario',
    'effect-callback',
    'sub-scenario',
    'effect-callback',
    'sub-scenario',
  ]);
});

test('automatically assigns id when not provided', () => {
  expect(effect([], () => undefined).config.id).not.toBeUndefined();
});

test('applies custom config', () => {
  const { config } = effect([], () => undefined, {
    id: 'effect-test',
    tags: ['awai', 'effect-test'],
  });

  expect(config.id).toBe('effect-test');
  expect(config.tags).toEqual([SystemTag.EFFECT, 'awai', 'effect-test']);
});
