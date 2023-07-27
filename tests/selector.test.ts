import { asyncState, delay, selector, state } from '../src';

describe('selector', () => {
  it('composes sync states properly', async () => {
    const state1 = state<number>(1);
    const state2 = state<number>(2);
    const state3 = state<number>(3);

    const stateSum = selector([state1, state2, state3], (a, b, c) => a + b + c);

    expect(stateSum.get()).toEqual(6);
  });

  it('creates async composed state with any initial value', async () => {
    const state1 = asyncState(1);
    const state2 = asyncState(Promise.resolve(2));
    const state3 = asyncState(() => 3);
    const state4 = asyncState(() => Promise.resolve(4));
    const state5 = asyncState(delay(200).then(() => 5));

    expect(state1.get()).toBe(1);
    expect(state2.get()).toBe(undefined);
    expect(await state2).toBe(2);
    expect(state3.get()).toBe(3);
    expect(state4.get()).toBe(4);
    expect(state5.get()).toBe(undefined);
    expect(await state5.getPromise()).toBe(5);
  });

  it('only calls callback when all async dependencies are resolved', async () => {
    const state = asyncState(delay(100).then(() => 'test'));
    const publicatedState = selector([state], (state) => {
      expect(state).toBe('test');
      return state!.repeat(2);
    });
    expect(await publicatedState.getPromise()).toBe('testtest');
  });
});
