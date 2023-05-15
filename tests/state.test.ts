import { state } from '../src';

describe('state', () => {
  it('is updated asynchronously', async () => {
    const greeting = state<string>('Hi');

    await greeting.set('Hello');
    expect(greeting.get()).toEqual('Hello');
  });

  it('has `changed` AwaitableEvent event', async () => {
    const greeting = state<string>('Hello');
    expect(greeting).toHaveProperty('events');
    expect(greeting.events).toHaveProperty('changed');
    expect(greeting.events.changed).resolves.toEqual('Hello there');
    greeting.set('Hello there');
  });

  it('is Promise-like and resolves with current value', async () => {
    const greeting = state<string>('Hello');
    await greeting.set('Hello there');
    expect(await greeting).toEqual('Hello there');
  });

  it('awaits for the right event', async () => {
    const CODE = 1234;
    const pin = state(CODE);

    const correctPinPromise = pin.events.changed.filter((newPin) => newPin === CODE);

    queueMicrotask(async () => {
      await pin.set(4321);
      await pin.set(1111);
      await pin.set(CODE);
      await pin.set(2222);
    });

    await expect(correctPinPromise).resolves.toBe(CODE);
  });
});
