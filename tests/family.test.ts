import { family } from '../src';

const greetings = family<string>();

const GREETING_1_ID = '#1';
const GREETING_2_ID = '#2';

describe('family', () => {
  it('is keeps items map', async () => {
    await greetings.set(GREETING_1_ID, 'Hi');
    await greetings.set(GREETING_2_ID, 'Hey');

    expect(greetings.keys()).toHaveLength(2);
    expect(greetings.get(GREETING_1_ID)).toEqual('Hi');
    expect(greetings.get(GREETING_2_ID)).toEqual('Hey');
  });
});
