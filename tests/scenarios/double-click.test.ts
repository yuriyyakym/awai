import { action, delay, scenario, rejectAfter } from '../../src';

const DOUBLE_CLICK_TIMEOUT = 200;

describe('Scenario: Double click', () => {
  const click = action();
  const doubleClick = jest.fn();

  scenario(async () => {
    await click.events.invoke;
    await Promise.race([click.events.invoke, rejectAfter(DOUBLE_CLICK_TIMEOUT)]);
    await doubleClick();
  });

  it('catches double clicks properly', async () => {
    await click();
    await delay(DOUBLE_CLICK_TIMEOUT - 1);
    await click();

    await click();
    await delay(DOUBLE_CLICK_TIMEOUT + 1);
    await click();

    await click();
    await delay(DOUBLE_CLICK_TIMEOUT - 1);
    await click();

    expect(doubleClick).toBeCalledTimes(2);
  });
});
