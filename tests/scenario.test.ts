import { expect, test, vi } from 'vitest';

import { SystemTag, action, delay, flush, scenario } from '../src';

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

test('handles cyclic strategies properly', async () => {
  const click = action();
  const callback = vi.fn(() => delay(10));

  scenario(click.events.invoked, callback, { strategy: 'cyclic' });

  click();
  click();
  await delay(30);
  click();

  await flush();

  expect(callback.mock.calls.length).toEqual(2);
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
