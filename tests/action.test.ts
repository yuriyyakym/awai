import { expect, test } from 'vitest';

import { action, delay, flush, scenario } from '../src';

test('uses unique ID for each invocation', async () => {
  const greet = action((name: string) => `Hello ${name}`);

  const firstEvent = greet.events.invoked;
  expect(firstEvent).resolves.toMatchObject({
    invocationId: expect.stringMatching(/^awai\$invocation\$\d+$/),
  });

  await greet('First');

  const secondEvent = greet.events.invoked;
  expect(secondEvent).resolves.toMatchObject({
    invocationId: expect.stringMatching(/^awai\$invocation\$\d+$/),
  });
  expect(firstEvent).resolves.not.toEqual(secondEvent);

  greet('Second');
});

test('uses same ID for all events of a single invocation', async () => {
  const greet = action((name: string) => `Hello ${name}`);

  expect(
    Promise.all([greet.events.invoked, greet.events.fulfilled]).then(
      ([invoked, fulfilled]) => invoked.invocationId === fulfilled.invocationId,
    ),
  ).resolves.toBe(true);

  await flush();
  await greet('Awai');
});

test('uses same invocation ID for rejected events', async () => {
  const greet = action((name: string) => {
    throw new Error(`Failed for ${name}`);
  });

  expect(
    Promise.all([greet.events.invoked, greet.events.rejected]).then(
      ([invoked, rejected]) => invoked.invocationId === rejected.invocationId,
    ),
  ).resolves.toBe(true);

  await flush();
  expect(() => greet('Awai')).rejects.toThrow('Failed for Awai');
});

test('uses different invocation IDs for different invocations', async () => {
  const greet = action(async (delayMs: number) => {
    await delay(delayMs);
    return `Delayed ${delayMs}`;
  });

  const orderedInvocationsIds: string[] = [];
  const orderedFulfillmentIds: string[] = [];
  let invokedCount = 0;
  let fulfilledCount = 0;

  const idsReadingScenario = scenario(
    greet.events.invoked,
    (invoked) => {
      orderedInvocationsIds.push(invoked.invocationId);
      invokedCount++;
    },
    { until: () => invokedCount >= 3 },
  );

  const idsFulfillmentReadingScenario = scenario(
    greet.events.fulfilled,
    (fulfilled) => {
      orderedFulfillmentIds.push(fulfilled.invocationId);
      fulfilledCount++;
    },
    { until: () => fulfilledCount >= 3 },
  );

  greet(300);
  greet(100);
  greet(200);

  await Promise.all([
    idsReadingScenario.events.settled,
    idsFulfillmentReadingScenario.events.settled,
  ]);

  expect(orderedFulfillmentIds).toEqual([
    orderedInvocationsIds[1],
    orderedInvocationsIds[2],
    orderedInvocationsIds[0],
  ]);
});

test('emits invoked event when called', async () => {
  const greet = action();
  expect(greet.events.invoked).resolves.toStrictEqual({
    arguments: [],
    config: greet.config,
    invocationId: expect.stringMatching(/^awai\$invocation\$\d+$/),
  });
  greet();
});

test('passes arguments to a callback and emits them in `invoked` event payload', async () => {
  const greet = action((name) => `Hello ${name}`);

  expect(greet.events.invoked).resolves.toStrictEqual({
    arguments: ['Awai'],
    config: greet.config,
    invocationId: expect.stringMatching(/^awai\$invocation\$\d+$/),
  });

  greet('Awai');
});

test('passes arguments to `invoked` event even action is empty', async () => {
  const greet = action<[greeting: string, name: string]>();

  expect(greet.events.invoked).resolves.toStrictEqual({
    arguments: ['Hello', 'Awai'],
    config: greet.config,
    invocationId: expect.stringMatching(/^awai\$invocation\$\d+$/),
  });

  greet('Hello', 'Awai');
});

test('returns Promise of a value returned by callback', async () => {
  const greet = action((name) => `Hello ${name}`);
  const result = greet('Awai');
  expect(result).toBeInstanceOf(Promise);
  expect(result).resolves.toEqual('Hello Awai');
});

test('emits result of callback in `fulfilled` event payload', async () => {
  const greet = action((name) => `Hello ${name}`);

  expect(greet.events.fulfilled).resolves.toStrictEqual({
    arguments: ['Awai'],
    result: 'Hello Awai',
    config: greet.config,
    invocationId: expect.stringMatching(/^awai\$invocation\$\d+$/),
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
    invocationId: expect.stringMatching(/^awai\$invocation\$\d+$/),
  });

  expect(() => greet('Awai')).rejects.toEqual('Hello Awai');
});
