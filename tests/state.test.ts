import { State } from '../src';

describe('state', () => {
  it('is updated asynchronously', async () => {
    const state = new State<string>('Hello');

    state.setValue('Hello there');
    expect(state.value).toEqual('Hello there'); // It's expected. `setValue` is async

    await state.setValue('Hello there!!!');
    expect(state.value).toEqual('Hello there!!!');
  });

  it('has `changed` AwaitableEvent', async () => {
    const state = new State<string>('Hello');
    expect(state).toHaveProperty('changed');
    expect(state.changed).resolves.toEqual('Hello there');
    state.setValue('Hello there');
  });

  it('is Promise-like and resolves with current value', async () => {
    const state = new State<string>('Hello');
    await state.setValue('Updated Hello');
    expect(await state).toEqual('Updated Hello');
  });
});
