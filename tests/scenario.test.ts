import { expect, test, vi } from 'vitest';

import {
  AwaiEvent,
  SystemTag,
  action,
  delay,
  flush,
  registry,
  rejectAfter,
  scenario,
} from '../src';

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

test('runs scenario without trigger with `cyclic` strategy', async () => {
  const tick = vi.fn();
  const { config } = scenario(async () => {
    await delay(5);
    tick();
  });
  await flush();
  await delay(15);
  expect(config.strategy).toEqual('cyclic');
  expect(tick.mock.calls.length).toBeGreaterThan(1);
});

test('handles trigger factory', async () => {
  const onTick = vi.fn();
  scenario(() => delay(20), onTick);
  await delay(70);
  expect(onTick.mock.calls.length).toEqual(3);
});

test('continues handling scenarios after rejected', async () => {
  const tick = vi.fn();
  const resolve = action();
  const reject = action();

  scenario(() => {
    return Promise.race([
      resolve.events.invoked,
      reject.events.invoked.then(() => Promise.reject()),
    ]);
  }, tick);

  await resolve();
  expect(tick.mock.calls.length).toEqual(1);
  await reject();
  expect(tick.mock.calls.length).toEqual(1);
  await resolve();
  expect(tick.mock.calls.length).toEqual(2);
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
  await click();

  expect(cyclicCallback.mock.calls.length).toBe(2);
  expect(forkCallback.mock.calls.length).toBe(4);
  expect(onceCallback.mock.calls.length).toBe(1);
});

test('emits `completed` event', async () => {
  const click = action();
  const onCompleted = vi.fn();

  const testScenario = scenario(click.events.invoked, () => delay(10), { strategy: 'cyclic' });
  scenario(testScenario.events.fulfilled, onCompleted);

  click();
  click();
  expect(onCompleted.mock.calls.length).toBe(0);
  await delay(15);
  expect(onCompleted.mock.calls.length).toBe(1);
  click();
  await delay(5);
  expect(onCompleted.mock.calls.length).toBe(1);
  click();
  await testScenario.events.fulfilled;

  expect(onCompleted.mock.calls.length).toBe(2);
});

test('emits `failed` event', async () => {
  const onFailure = vi.fn();

  const testScenario = scenario(delay(5), () => rejectAfter(5));
  scenario(testScenario.events.rejected, onFailure);

  expect(testScenario.config.strategy).toBe('once');
  await delay(15);
  expect(onFailure.mock.calls.length).toBe(1);
});

test('runs again after failure', async () => {
  const onFailure = vi.fn();

  const testScenario = scenario(
    () => delay(10),
    () => Promise.reject(),
  );
  scenario(testScenario.events.rejected, onFailure);

  await delay(35);
  expect(testScenario.config.strategy).toEqual('fork');
  expect(onFailure.mock.calls.length).toEqual(3);
});

test('emits `failed` event for non-async callback', async () => {
  const onFailure = vi.fn();

  const testScenario = scenario(delay(5), () => {
    throw new Error('test error');
  });
  scenario(testScenario.events.rejected, onFailure);

  await delay(10);
  expect(testScenario.config.strategy).toBe('once');
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
  expect(config.tags).toEqual([SystemTag.SCENARIO, 'awai', 'scenario-test']);
});

test('uses `cyclic` strategy if plain promise provided', async () => {
  const tick = vi.fn();

  const { config } = scenario(delay(5), tick);
  expect(config.strategy).toBe('once');
  expect(tick.mock.calls.length).toBe(0);
  await delay(10);
  expect(tick.mock.calls.length).toBe(1);
});

test('deregisters from registry when expired', async () => {
  let count = 0;
  const testScenario = scenario(
    () => delay(10),
    () => {
      count++;
    },
    { until: () => count >= 2 },
  );

  await testScenario.events.settled;
  const id = await registry.events.deregistered;

  expect(id).toEqual(testScenario.config.id);
});

test('handles expiration by promise', async () => {
  const tick = vi.fn();
  const testScenario = scenario(() => delay(20), tick, { until: delay(50) });
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(2);
});

test('handles expiration by AwaiEvent', async () => {
  const stop = action();
  const tick = vi.fn();
  const testScenario = scenario(() => delay(20), tick, { until: stop.events.invoked });
  setTimeout(stop, 50);
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(2);
});

test('handles expiration by predicate', async () => {
  const tick = vi.fn();
  let count = 0;
  const testScenario = scenario(
    () => delay(10),
    () => {
      count++;
      tick();
    },
    { until: () => count >= 3 },
  );
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(3);
});

test('emits `settled` event after last scenario callback evaluated (once)', async () => {
  const tick = vi.fn();
  const testScenario = scenario(delay(20), tick);
  await testScenario.events.fulfilled;
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(1);
});

test('emits `settled` event after last scenario callback evaluated (failure)', async () => {
  const tick = vi.fn();
  const testScenario = scenario(
    () => delay(20),
    () => {
      tick();
      throw new Error('test');
    },
    { until: delay(50) },
  );
  await testScenario.events.rejected;
  expect(tick.mock.calls.length).toBe(1);
  await testScenario.events.rejected;
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(2);
});

test('emits `settled` event after last scenario callback evaluated (fork)', async () => {
  const run = action<[ms: number]>();
  const tick = vi.fn();
  let completed = 0;

  const testScenario = scenario(
    run.events.invoked,
    async ({ arguments: [ms] }) => {
      await delay(ms);
      tick();
      completed++;
    },
    { strategy: 'fork', until: () => completed >= 3 },
  );

  run(30);
  run(20);
  run(10);

  await testScenario.events.fulfilled;
  expect(tick.mock.calls.length).toBe(1);
  await testScenario.events.fulfilled;
  expect(tick.mock.calls.length).toBe(2);
  await testScenario.events.fulfilled;
  await testScenario.events.settled;

  expect(tick.mock.calls.length).toBe(3);
});

test('emits `settled` event after last scenario callback evaluated (cyclic)', async () => {
  const run = action<[ms: number]>();
  const tick = vi.fn();
  let completed = 0;

  const testScenario = scenario(
    run.events.invoked,
    async ({ arguments: [ms] }) => {
      await delay(ms);
      tick();
      completed++;
    },
    { strategy: 'cyclic', until: () => completed >= 3 },
  );

  run(10);
  await testScenario.events.fulfilled;
  run(20);
  await testScenario.events.fulfilled;
  run(10);
  await testScenario.events.fulfilled;
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(3);
});

test('expires event with event value', async () => {
  const expire = action<[value: string]>();
  const tick = vi.fn();
  const testScenario = scenario(() => delay(10), tick, { until: expire.events.invoked });
  setTimeout(expire, 0, 'Awai');
  const { event } = await testScenario.events.settled;
  expect(event?.arguments[0]).toEqual('Awai');
});

test('expires with promise', async () => {
  const testScenario = scenario(
    () => delay(3),
    () => delay(3),
    { until: delay(5).then(() => 'Awai delayed settlment') },
  );
  const { event } = await testScenario.events.settled;
  expect(event).toEqual('Awai delayed settlment');
});

test('expires with AbortSignal', async () => {
  const abortController = new AbortController();
  const testScenario = scenario(
    () => delay(3),
    () => undefined,
    { until: abortController.signal },
  );
  setTimeout(() => abortController.abort(), 10);
  const { event } = await testScenario.events.settled;
  expect(event).toBeUndefined();
});

test('expires immediately if AbortSignal is already aborted', async () => {
  const abortController = new AbortController();
  abortController.abort();

  const trigger = new AwaiEvent();
  const testScenario = scenario(trigger, () => undefined, { until: abortController.signal });

  const result = await Promise.race([testScenario.events.settled, delay(30).then(() => 'timeout')]);
  expect(result).not.toBe('timeout');
});

test('does not reschedule when aborted trigger rejects', async () => {
  const abortController = new AbortController();
  const trigger = new AwaiEvent();
  const triggerFactory = vi.fn(() => trigger.abortable(abortController.signal));

  const testScenario = scenario(triggerFactory, () => undefined, { until: abortController.signal });

  abortController.abort();
  await testScenario.events.settled;
  await delay(10);

  expect(triggerFactory.mock.calls.length).toBe(1);
});

test('expires with event even if expired during callback execution', async () => {
  const expire = action<[value: string]>();
  const tick = vi.fn(async () => await delay(3));
  const testScenario = scenario(() => delay(3), tick, { until: expire.events.invoked });
  setTimeout(expire, 5, 'Awai delayed settlment');
  const { event } = await testScenario.events.settled;
  expect(event?.arguments[0]).toEqual('Awai delayed settlment');
});

test('is thennable and resolves along with `settled` event', async () => {
  const expire = action<[value: string]>();
  const tick = vi.fn();
  const testScenario = scenario(() => delay(10), tick, { until: expire.events.invoked });
  setTimeout(expire, 0, 'Awai');
  expect(testScenario.then()).resolves.toMatchObject({ event: { arguments: ['Awai'] } });
  expect(testScenario.then(({ event }) => event?.arguments[0].repeat(2))).resolves.toEqual(
    'AwaiAwai',
  );
  const { event } = await testScenario;
  expect(event?.arguments[0]).toEqual('Awai');
});

test('warns when infinite scenario is awaited', async () => {
  const originalWarn = console.warn;
  const warnMock = vi.fn();
  console.warn = warnMock;
  const tick = vi.fn();

  const testScenario = scenario(() => delay(10), tick);
  setTimeout(async () => {
    await testScenario;
  }, 0);
  await delay(10);
  expect(warnMock.mock.calls.length).toEqual(1);
  console.warn = originalWarn;
});

test('allows passing custom properties in config', () => {
  const { config } = scenario(delay(10), () => undefined, { lib: 'Awai' });
  expect(config).toMatchObject({ lib: 'Awai' });
});
