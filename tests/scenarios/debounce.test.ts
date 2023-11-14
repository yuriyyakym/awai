import { expect, test, vi } from 'vitest';

import { action, delay, scenario } from '../../src';

const DEBOUNCE_TIMEOUT = 20;

test('[Flow]: Debounce', async () => {
  const click = action();
  const debouncedFunction = vi.fn();

  scenario(click.events.invoked, async () => {
    await Promise.race([
      delay(DEBOUNCE_TIMEOUT),
      click.events.invoked.then(() => Promise.reject()),
    ]);
    debouncedFunction();
  });

  await click();
  await delay(DEBOUNCE_TIMEOUT + 10);
  await click();
  expect(debouncedFunction.mock.calls.length).toEqual(1);
  await delay(DEBOUNCE_TIMEOUT - 10);
  await click();
  expect(debouncedFunction.mock.calls.length).toEqual(1);
  await delay(DEBOUNCE_TIMEOUT - 10);
  await click();
  expect(debouncedFunction.mock.calls.length).toEqual(1);
  await delay(DEBOUNCE_TIMEOUT - 10);
  await click();
  expect(debouncedFunction.mock.calls.length).toEqual(1);
  await delay(DEBOUNCE_TIMEOUT - 10);
  await click();
  expect(debouncedFunction.mock.calls.length).toEqual(1);
  await click();
  await click();
  expect(debouncedFunction.mock.calls.length).toEqual(1);
  await delay(DEBOUNCE_TIMEOUT + 10);
  await click();
  expect(debouncedFunction.mock.calls.length).toEqual(2);
  await delay(DEBOUNCE_TIMEOUT + 10);
  await click();
  expect(debouncedFunction.mock.calls.length).toEqual(3);
});
