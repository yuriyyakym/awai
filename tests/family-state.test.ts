import { delay, familyState, scenario, scenarioOnEvery, selector, state } from '../src';

describe('familyState', () => {
  it('creates states using initializer', async () => {
    const family = familyState((id) => `${id}-test`);

    const node1 = family.getNode('1');
    const node2 = family.getNode('2');

    expect(node1.get()).toEqual('1-test');
    expect(node2.get()).toEqual('2-test');
  });

  it('creates async states using initializer', async () => {
    const family = familyState(
      (id) =>
        new Promise(async (resolve) => {
          await delay(30);
          resolve(`${id}-test`);
        }),
    );

    const node1 = family.getNode('1');
    const node2 = family.getNode('2');

    await Promise.all([node1.events.changed, node2.events.changed]);

    expect(node1.get()).toEqual('1-test');
    expect(node2.get()).toEqual('2-test');
  });

  it('emits change event when node added', async () => {
    const family = familyState(
      (id) =>
        new Promise(async (resolve) => {
          await delay(30);
          resolve(`${id}-test`);
        }),
    );

    const onFamilyChanged = jest.fn();

    scenarioOnEvery(family.events.changed, async () => {
      onFamilyChanged();
    });

    const node1 = family.getNode('1');
    const node2 = family.getNode('2');
    await delay(40);
    await node1.set(3);
    await node2.set(4);
    await delay(100);

    expect(onFamilyChanged.mock.calls.length).toBe(4);
  });

  it('returns same node for the same key', async () => {
    const family = familyState((id) => `${id}-test`);
    const node1 = family.getNode('1');
    const node2 = family.getNode('1');
    expect(node1).toEqual(node2);
  });
});
