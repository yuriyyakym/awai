import { expect, test } from 'vitest';

import { AwaiEvent } from '../src';

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