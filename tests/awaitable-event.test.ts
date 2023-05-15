import { AwaitableEvent } from '../src';

describe('AwaitableEvent', () => {
  it('filters out non-applicable events', async () => {
    const number = new AwaitableEvent<number>();
    const awaitedNumber = 2;

    queueMicrotask(async () => {
      await number.emit(1);
      await number.emit(2);
      await number.emit(3);
    });

    const numberPromise = number.filter((n) => n === awaitedNumber);
    await expect(numberPromise).resolves.toBe(awaitedNumber);
  });
});
