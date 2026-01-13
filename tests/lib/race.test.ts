import { expect, test, vi } from 'vitest';

import { AwaiEvent, delay, flush, race } from '../../src';
import rejectAfter from '../../src/lib/rejectAfter';

test('races regular promises and returns the first resolved value', async () => {
  const promise1 = delay(10).then(() => 'first');
  const promise2 = delay(20).then(() => 'second');
  const promise3 = delay(5).then(() => 'third');

  const result = await race([promise1, promise2, promise3]);

  expect(result).toBe('third');
});

test('races AwaiEvents and returns the first emitted value', async () => {
  const event1 = new AwaiEvent<string>();
  const event2 = new AwaiEvent<string>();
  const event3 = new AwaiEvent<string>();

  const racePromise = race([event1, event2, event3]);

  await delay(10);
  event2.emit('second');
  await flush();

  const result = await racePromise;
  expect(result).toBe('second');
});

test('races mixed promises and AwaiEvents', async () => {
  const promise = delay(30).then(() => 'promise');
  const event = new AwaiEvent<string>();

  const racePromise = race([promise, event]);

  await delay(10);
  event.emit('event');
  await flush();

  const result = await racePromise;
  expect(result).toBe('event');
});

test('handles rejection from promises', async () => {
  const promise1 = delay(10).then(() => 'success');
  const promise2 = rejectAfter(5);

  await expect(race([promise1, promise2])).rejects.toBeUndefined();
});

test('aborts internal AbortController when external AbortController is aborted', async () => {
  const abortController = new AbortController();
  const event1 = new AwaiEvent<string>();
  const event2 = new AwaiEvent<string>();

  const racePromise = race([event1, event2], abortController);

  await delay(10);
  abortController.abort();

  await expect(racePromise).rejects.toBe('Aborted');
});

test('cleans up abort listeners after completion', async () => {
  const abortController = new AbortController();
  const event = new AwaiEvent<string>();

  const removeEventListenerSpy = vi.spyOn(abortController.signal, 'removeEventListener');

  const racePromise = race([event], abortController);

  await delay(10);
  event.emit('value');
  await flush();

  await racePromise;

  expect(removeEventListenerSpy).toHaveBeenCalledWith('abort', expect.any(Function));
});

test('aborts all AwaiEvents when race completes', async () => {
  const event1 = new AwaiEvent<string>();
  const event2 = new AwaiEvent<string>();

  const abortable1Spy = vi.spyOn(event1, 'abortable');
  const abortable2Spy = vi.spyOn(event2, 'abortable');

  const racePromise = race([event1, event2]);

  await delay(10);
  event1.emit('first');
  await flush();

  await racePromise;

  expect(abortable1Spy).toHaveBeenCalled();
  expect(abortable2Spy).toHaveBeenCalled();
});
