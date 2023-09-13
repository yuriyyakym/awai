import { expect, test, vi } from 'vitest';

import { delay, familyState, scenario } from '../src';

test('creates states using initializer', async () => {
  const family = familyState((id) => `${id}-test`);

  const node1 = family.getNode('1');
  const node2 = family.getNode('2');

  expect(node1.get()).toEqual('1-test');
  expect(node2.get()).toEqual('2-test');
});

test('creates async states using initializer', async () => {
  const family = familyState((id) => delay(30).then(() => `${id}-test`));

  const node1 = family.getNode('1');
  const node2 = family.getNode('2');

  await Promise.all([node1.events.changed, node2.events.changed]);

  expect(node1.get()).toEqual('1-test');
  expect(node2.get()).toEqual('2-test');
});

test('emits change event when node added', async () => {
  const family = familyState((id) => delay(30).then(() => `${id}-test`));
  const onFamilyChanged = vi.fn();

  scenario(family.events.changed, onFamilyChanged);

  const node1 = family.getNode('1');
  const node2 = family.getNode('2');
  await delay(20);
  await node1.set('3');
  await delay(20);
  await node2.set('4');

  expect(onFamilyChanged.mock.calls.length).toBe(5);
});

test('returns same node for the same key', async () => {
  const family = familyState((id) => `${id}-test`);
  const node1 = family.getNode('1');
  const node2 = family.getNode('1');
  expect(node1).toEqual(node2);
});
