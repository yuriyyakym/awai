import { delay } from '../src';
import asyncState from '../src/async-state/async-state';

describe('async-state', () => {
  it('resolves immediately if non-async value is set', async () => {
    const greeting = asyncState<string>('Async state');

    expect(greeting.get()).toBe('Async state');
  });

  it('`requested` event is not emited when raw value is non-async value is set', async () => {
    const fruit = asyncState<string>('apple');
    const value = await Promise.race([
      fruit.events.requested.then(() => 'emited'),
      delay(50).then(() => 'not emited'),
    ]);
    expect(value).toBe('not emited');
  });

  it('emits `requested` and `loaded` events in proper order', async () => {
    const greeting = asyncState<string>();

    setTimeout(greeting.set, 500, Promise.resolve('Magic message'));

    expect(greeting.get()).toBe(undefined);
    const value = await greeting.events.changed;
    expect(value).toBe('Magic message');
  });
});
