import { expect, test, vi } from 'vitest';

import { action, delay, flush, rejectAfter, scenario } from '../../src';

const DOUBLE_CLICK_TIMEOUT = 200;

test('[Scenario] Double click', async () => {
  const click = action();
  const onDoubleClick = vi.fn();

  scenario(click.events.invoked, async () => {
    await Promise.race([click.events.invoked, rejectAfter(DOUBLE_CLICK_TIMEOUT)]);
    onDoubleClick();
  });

  await click();
  await delay(DOUBLE_CLICK_TIMEOUT - 10);
  await click();

  await delay(DOUBLE_CLICK_TIMEOUT + 10);

  await click();
  await delay(DOUBLE_CLICK_TIMEOUT + 10);
  await click();

  await delay(DOUBLE_CLICK_TIMEOUT + 10);

  await click();
  await delay(DOUBLE_CLICK_TIMEOUT - 10);
  await click();

  await delay(DOUBLE_CLICK_TIMEOUT + 10);

  await click();
  await click();

  await flush();

  expect(onDoubleClick).toBeCalledTimes(3);
});
