import { expect, test, vi } from 'vitest';

import { SystemTag, action, delay, flush, registry, rejectAfter, scenario } from '../src';

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
  const testScenario = scenario(
    () => delay(10),
    () => undefined,
    { repeat: 2 },
  );

  await testScenario.events.settled;
  const id = await registry.events.deregistered;

  expect(id).toEqual(testScenario.config.id);
});

test('handles expiration by promise', async () => {
  const tick = vi.fn();
  const testScenario = scenario(() => delay(20), delay(50), tick);
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(2);
});

test('handles expiration by AwaiEvent', async () => {
  const stop = action();
  const tick = vi.fn();
  const testScenario = scenario(() => delay(20), stop.events.invoked, tick);
  setTimeout(stop, 50);
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(2);
});

test('handles expiration by predicate', async () => {
  const timestamp = Date.now();
  const tick = vi.fn();
  const dateScenario = scenario(
    () => delay(20),
    () => Date.now() >= timestamp + 50,
    tick,
  );
  await dateScenario.events.settled;
  expect(tick.mock.calls.length).toBe(3);
});

test('repeats scenario specified amount of times', async () => {
  const tick = vi.fn();
  const testScenario = scenario(() => delay(10), tick, { repeat: 3 });
  await testScenario.events.fulfilled;
  await testScenario.events.fulfilled;
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(3);
});

test('emits `expired` event after last scenario callback evaluated (once)', async () => {
  const tick = vi.fn();
  const testScenario = scenario(delay(20), delay(50), tick);
  await testScenario.events.fulfilled;
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(1);
});

test('emits `expired` event after last scenario callback evaluated (failure)', async () => {
  const tick = vi.fn();
  const testScenario = scenario(
    () => delay(20),
    delay(50),
    () => {
      tick();
      throw new Error('test');
    },
  );
  await testScenario.events.rejected;
  expect(tick.mock.calls.length).toBe(1);
  await testScenario.events.rejected;
  await testScenario.events.settled;
  expect(tick.mock.calls.length).toBe(2);
});

test('emits `expired` event after last scenario callback evaluated (fork)', async () => {
  const run = action<[ms: number]>();
  const tick = vi.fn();

  const testScenario = scenario(
    run.events.invoked,
    async ({ arguments: [ms] }) => {
      await delay(ms);
      tick();
    },
    { repeat: 3, strategy: 'fork' },
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

test('emits `expired` event after last scenario callback evaluated (cyclic)', async () => {
  const run = action<[ms: number]>();
  const tick = vi.fn();

  const testScenario = scenario(
    run.events.invoked,
    async ({ arguments: [ms] }) => {
      await delay(ms);
      tick();
    },
    { repeat: 3, strategy: 'cyclic' },
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

test('expires `expired` event with even value', async () => {
  const expire = action<[value: string]>();
  const tick = vi.fn();
  const testScenario = scenario(() => delay(10), expire.events.invoked, tick);
  setTimeout(expire, 0, 'Awai');
  const { event } = await testScenario.events.settled;
  expect(event?.arguments[0]).toEqual('Awai');
});

test('handles both `repeat` and `repeatUntil` if both specified', async () => {
  const tick1 = vi.fn();
  const testScenario1 = scenario(() => delay(10), delay(50), tick1, { repeat: 2 });
  await testScenario1.events.fulfilled;
  expect(tick1.mock.calls.length).toBe(1);
  await testScenario1.events.fulfilled;
  await testScenario1.events.settled;
  expect(tick1.mock.calls.length).toBe(2);

  const tick2 = vi.fn();
  const testScenario2 = scenario(() => delay(20), delay(50), tick2, { repeat: 10 });
  await testScenario2.events.fulfilled;
  expect(tick2.mock.calls.length).toBe(1);
  await testScenario2.events.settled;
  expect(tick2.mock.calls.length).toBe(2);
});

test('is thennable and resolves along with `expired` event', async () => {
  const expire = action<[value: string]>();
  const tick = vi.fn();
  const testScenario = scenario(() => delay(10), expire.events.invoked, tick);
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
