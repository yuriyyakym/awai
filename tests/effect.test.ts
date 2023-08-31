import { asyncState, delay, effect, state } from '../src';

describe('effect', () => {
  it('Runs effect immediately with sync states', async () => {
    const state1 = state<number>(1);
    const state2 = state<number>(2);

    const callback = jest.fn();

    effect([state1, state2], callback);

    expect(callback.call.length).toEqual(1);
  });

  it('Does not return cleanup if such was not returned', async () => {
    const state1 = state<number>(1);
    const state2 = state<number>(2);

    const cleanup = effect([state1, state2], () => undefined);

    expect(cleanup).toBe(undefined);
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

    await delay(15);
    await state2.set(3);
    await state2.set(4);
    await state2.set(5);

    expect(registerActionsOrder).toEqual([0, 2, 4, 6]);
    expect(cleanupActionsOrder).toEqual([1, 3, 5]);
  });
});
