import { expect, test, vi } from 'vitest';

import { SystemTag, action, delay, flush, rejectAfter, scenario } from '../src';

test('runs scenario on event', async () => {
  const click = action();
  const callback = vi.fn(() => delay(10));

  scenario(click.events.invoked, callback);

  click();
  click();
  click();

  await flush();

  expect(callback.mock.calls.length).toEqual(3);
});

test('handles trigger factory', async () => {
  const onTick = vi.fn();
  scenario(() => delay(10), onTick);
  await delay(35);
  expect(onTick.mock.calls.length).toEqual(3);
});

test('handles strategies properly', async () => {
  const click = action();

  const cyclicCallback = vi.fn(() => delay(10));
  const forkCallback = vi.fn(() => delay(10));
  const onceCallback = vi.fn(() => delay(10));

  scenario(click.events.invoked, cyclicCallback, { strategy: 'cyclic' });
  scenario(click.events.invoked, forkCallback, { strategy: 'fork' });
  scenario(click.events.invoked, onceCallback, { strategy: 'once' });

  click();
  click();
  await delay(30);
  click();
  await delay(5);
  click();

  await flush();

  expect(cyclicCallback.mock.calls.length).toBe(2);
  expect(forkCallback.mock.calls.length).toBe(4);
  expect(onceCallback.mock.calls.length).toBe(1);
});

test('emits `started` event', async () => {
  const click = action();
  const callback = () => delay(10);

  const cyclicCallback = vi.fn();
  const forkCallback = vi.fn();
  const onceCallback = vi.fn();

  const cyclicScenario = scenario(click.events.invoked, callback, { strategy: 'cyclic' });
  const forkScenario = scenario(click.events.invoked, callback, { strategy: 'fork' });
  const onceScenario = scenario(click.events.invoked, callback, { strategy: 'once' });

  scenario(cyclicScenario.events.started, cyclicCallback);
  scenario(forkScenario.events.started, forkCallback);
  scenario(onceScenario.events.started, onceCallback);

  click();
  click();
  await delay(30);
  click();
  await delay(5);
  click();

  await flush();

  expect(cyclicCallback.mock.calls.length).toBe(2);
  expect(forkCallback.mock.calls.length).toBe(4);
  expect(onceCallback.mock.calls.length).toBe(1);
});

test('emits `completed` event', async () => {
  const click = action();
  const onCompleted = vi.fn();

  const testScenario = scenario(click.events.invoked, () => delay(10), { strategy: 'cyclic' });
  scenario(testScenario.events.completed, onCompleted);

  click();
  click();
  await delay(30);
  click();
  await delay(5);
  click();
  await delay(5);

  await flush();

  expect(onCompleted.mock.calls.length).toBe(2);
});

test('emits `failed` event', async () => {
  const click = action();
  const onFailure = vi.fn();

  const testScenario = scenario(click.events.invoked, () => rejectAfter(5), {
    strategy: 'cyclic',
  });

  scenario(testScenario.events.failed, onFailure);

  click();

  await delay(10);

  expect(onFailure.mock.calls.length).toBe(1);
});

test('automatically assigns id when not provided', () => {
  expect(scenario(async () => delay(10)).config.id).not.toBeUndefined();
});

test('applies custom config', () => {
  const { config } = scenario(async () => delay(10), {
    id: 'scenario-test',
    tags: ['awai', 'scenario-test'],
  });

  expect(config.id).toBe('scenario-test');
  expect(config.tags).toEqual(['scenario', 'awai', 'scenario-test']);
  expect(config.tags).toContain(SystemTag.SCENARIO);
});
