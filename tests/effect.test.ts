import { asyncState, delay, effect, flush, registry, scenario, state } from '../src';

describe('effect', () => {
  it('Runs effect immediately with sync states', async () => {
    const state1 = state<number>(1);
    const state2 = state<number>(2);

    const callback = jest.fn();

    effect([state1, state2], callback);

    expect(callback.call.length).toEqual(1);
  });

  it('Does not emit `cleared` event when no cleanup function returned', async () => {
    const state1 = state<number>(1);
    const state2 = state<number>(2);

    const testEffect = effect([state1, state2], () => undefined);

    let cleanupsCount = 0;
    let runsCount = 0;

    scenario(testEffect.events.run, () => ++runsCount);
    scenario(testEffect.events.cleared, () => ++cleanupsCount);

    await state1.set(0);
    await state1.set(1);
    await state2.set(1);

    expect(runsCount).toEqual(4);
    expect(cleanupsCount).toEqual(0);
  });

  it('Emits `cleared` event when cleanup function returned', async () => {
    const state1 = state<number>(1);
    const state2 = state<number>(2);

    const testEffect = effect([state1, state2], () => () => undefined);

    let cleanupsCount = 0;
    let runsCount = 0;
    scenario(testEffect.events.run, () => ++runsCount);
    scenario(testEffect.events.cleared, () => ++cleanupsCount);

    await state1.set(0);
    await state1.set(1);
    await state2.set(1);

    expect(runsCount).toEqual(4);
    expect(cleanupsCount).toEqual(3);
  });

  it('Runs effect and cleans it up in a correct order', async () => {
    const state1 = state<number>(1);
    const state2 = asyncState<number>(delay(10).then(() => 2));

    let actionIndex = 0;

    const registerActionsOrder: number[] = [];
    const cleanupActionsOrder: number[] = [];

    const callback = (a: any) => {
      registerActionsOrder.push(actionIndex++);

      return () => {
        cleanupActionsOrder.push(actionIndex++);
      };
    };

    effect([state1, state2], callback);

    await state2.set(3);
    await state2.set(4);
    await state2.set(5);

    expect(registerActionsOrder).toEqual([0, 2, 4, 6]);
    expect(cleanupActionsOrder).toEqual([1, 3, 5]);
  });

  it('Registers effect before running', async () => {
    const state1 = state(1);
    let counter = 0;

    let callbackCallIndex: number;
    let registrationCallIndex: number;
    let subScenarioCallIndex: number;

    scenario(registry.events.registered, (node) => {
      if (node === testEffect) {
        scenario((node as typeof testEffect).events.run, () => {
          subScenarioCallIndex = counter++;
        });

        registrationCallIndex = counter++;
      }
    });

    const testEffect = effect([state1], () => {
      callbackCallIndex = counter++;
    });

    await flush();

    expect(registrationCallIndex!).toBe(0);
    expect(callbackCallIndex!).toBe(1);
    expect(subScenarioCallIndex!).toBe(2);
  });
});
