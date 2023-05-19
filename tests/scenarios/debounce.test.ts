import { action, delay, scenarioOnEvery } from '../../src';

const DEBOUNCE_TIMEOUT = 200;
const TIMEOUT_SYMBOL = Symbol();

describe('Scenario: Debounce', () => {
  const click = action();
  const debouncedFunction = jest.fn();

  scenarioOnEvery(click.events.invoke, async () => {
    const result = await Promise.race([
      click.events.invoke,
      delay(DEBOUNCE_TIMEOUT).then(() => TIMEOUT_SYMBOL),
    ]);

    if (result === TIMEOUT_SYMBOL) {
      debouncedFunction();
    }
  });

  it('catches double clicks properly', async () => {
    await click();
    await delay(DEBOUNCE_TIMEOUT + 1);
    await click();
    await delay(DEBOUNCE_TIMEOUT - 1);
    await click();
    await delay(DEBOUNCE_TIMEOUT - 1);
    await click();
    await delay(DEBOUNCE_TIMEOUT - 1);
    await click();
    await delay(DEBOUNCE_TIMEOUT - 1);
    await click();
    await click();
    await click();
    await delay(DEBOUNCE_TIMEOUT + 1);
    await click();
    await delay(DEBOUNCE_TIMEOUT + 1);
    await click();

    expect(debouncedFunction).toBeCalledTimes(3);
  });
});
