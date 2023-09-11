import { action, delay, scenario } from '../../src';

const DEBOUNCE_TIMEOUT = 200;

describe('Scenario: Debounce', () => {
  const click = action();
  const debouncedFunction = jest.fn();

  scenario(click.events.invoked, async () => {
    await Promise.race([
      delay(DEBOUNCE_TIMEOUT),
      click.events.invoked.then(() => Promise.reject()),
    ]);
    debouncedFunction();
  });

  it('catches double clicks properly', async () => {
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

    expect(debouncedFunction).toBeCalledTimes(3);
  });
});
