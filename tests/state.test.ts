import { state } from '../src';

describe('state', () => {
  it('is updated asynchronously', async () => {
    const greeting = state<string>('Hi');

    greeting.set('Hey');
    expect(greeting.get()).toEqual('Hi'); // It's expected. `setValue` is async

    await greeting.set('Hello');
    expect(greeting.get()).toEqual('Hello');
  });

  it('has `changed` AwaitableEvent', async () => {
    const greeting = state<string>('Hello');
    expect(greeting).toHaveProperty('changed');
    expect(greeting.events.changed).resolves.toEqual('Hello there');
    greeting.set('Hello there');
  });

  it('is Promise-like and resolves with current value', async () => {
    const greeting = state<string>('Hello');
    await greeting.set('Hello there');
    expect(await greeting).toEqual('Hello there');
  });
});
