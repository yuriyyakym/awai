import { asyncState, delay, selector, state } from '../src';

describe('selector', () => {
  it('composes sync states properly', async () => {
    const state1 = state<number>(1);
    const state2 = state<number>(2);
    const state3 = state<number>(3);

    const stateSum = selector([state1, state2, state3], (a, b, c) => a + b + c);

    expect(stateSum.get()).toEqual(6);
  });

  it('only calls callback when all async dependencies are resolved', async () => {
    const state = asyncState(delay(100).then(() => 'test'));
    const duplicatedState = selector([state], (state) => {
      expect(state).toBe('test');
      return state!.repeat(2);
    });
    expect(await duplicatedState.getPromise()).toBe('testtest');
  });
});
