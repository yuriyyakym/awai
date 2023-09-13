import { expect, test, vi } from 'vitest';

import { action, delay, scenario } from '../../src';

const DEBOUNCE_TIMEOUT = 200;

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
  await delay(DEBOUNCE_TIMEOUT + 50);
  await click();
  await delay(DEBOUNCE_TIMEOUT - 50);
  await click();
  await delay(DEBOUNCE_TIMEOUT - 50);
  await click();
  await delay(DEBOUNCE_TIMEOUT - 50);
  await click();
  await delay(DEBOUNCE_TIMEOUT - 50);
  await click();
  await click();
  await click();
  await delay(DEBOUNCE_TIMEOUT + 50);
  await click();
  await delay(DEBOUNCE_TIMEOUT + 50);
  await click();

  expect(debouncedFunction.mock.calls.length).toEqual(3);
});
