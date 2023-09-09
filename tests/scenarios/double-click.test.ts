import { action, delay, flush, rejectAfter, scenarioOnEvery } from '../../src';

const DOUBLE_CLICK_TIMEOUT = 200;

describe('Scenario: Double click', () => {
  const click = action();
  const onDoubleClick = jest.fn();

  scenarioOnEvery(click.events.invoked, async () => {
    await Promise.race([click.events.invoked, rejectAfter(DOUBLE_CLICK_TIMEOUT)]);
    onDoubleClick();
  });

  it('catches double clicks properly', async () => {
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
});
