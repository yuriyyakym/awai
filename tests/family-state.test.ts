import { expect, test, vi } from 'vitest';

import { SystemTag, delay, familyState, flush, scenario, state } from '../src';

test('creates states using initializer', async () => {
  const family = familyState((id) => `${id}-test`);

  const node1 = family.getNode('1');
  const node2 = family.getNode('2');

  expect(node1.config.tags).toContain(SystemTag.STATE);
  expect(node2.config.tags).toContain(SystemTag.STATE);
  expect(node1.get()).toEqual('1-test');
  expect(node2.get()).toEqual('2-test');
});

test('is thennable', async () => {
  const family = familyState((id) => `${id}-test`);
  const node = family.getNode('node');
  expect(family.then()).resolves.toEqual({ node });
  await family.then((record) => expect(record).toEqual({ node }));
});

test('creates async states using initializer', async () => {
  const family = familyState((id) => delay(30).then(() => `${id}-test`));
  const node1 = family.getNode('1');
  const node2 = family.getNode('2');

  expect(node1.config.tags).toContain(SystemTag.ASYNC_STATE);
  expect(node2.config.tags).toContain(SystemTag.ASYNC_STATE);
  expect(node1.events.fulfilled).resolves.toEqual(`1-test`);
  await Promise.all([node1.events.fulfilled, node2.events.fulfilled]);
  expect(node1.get()).toEqual('1-test');
  expect(node2.get()).toEqual('2-test');
});

test('emits `changed` event when node created by `getNode` method', async () => {
  const onFamilyChanged = vi.fn();
  const family = familyState((id) => `${id}-test`);
  scenario(family.events.changed, onFamilyChanged);
  family.getNode('1');
  family.getNode('2');
  await flush();
  expect(onFamilyChanged.mock.calls.length).toBe(2);
});

test('emits `changed` event when node set', async () => {
  const onFamilyChanged = vi.fn();
  const family = familyState((id) => `${id}-test`);
  scenario(family.events.changed, onFamilyChanged);
  await family.setNode('test', state('test'));
  expect(onFamilyChanged.mock.calls.length).toBe(1);
  await family.setNode('test2', state('test2'));
  expect(onFamilyChanged.mock.calls.length).toBe(2);
});

test('emits `changed` event when set node changes', async () => {
  const onFamilyChanged = vi.fn();
  const testState = state('test');
  const family = familyState((id) => `${id}-test`);
  scenario(family.events.changed, onFamilyChanged);
  await family.setNode('test', testState);
  expect(onFamilyChanged.mock.calls.length).toBe(1);
  await testState.set('Awai');
  expect(onFamilyChanged.mock.calls.length).toBe(2);
});

test('emits `stateCreated` once per requested key', async () => {
  const onNodeCreated = vi.fn();
  const family = familyState((id) => `${id}-test`);
  scenario(family.events.changed, onNodeCreated);
  family.getNode('1');
  await flush();
  expect(onNodeCreated.mock.calls.length).toBe(1);
  family.getNode('2');
  await flush();
  expect(onNodeCreated.mock.calls.length).toBe(2);
  family.getNode('1');
  await flush();
  expect(onNodeCreated.mock.calls.length).toBe(2);
});

test('emits `changed` event when any node changed', async () => {
  const onFamilyChanged = vi.fn();
  const family = familyState((id) => delay(30).then(() => `${id}-test`));
  const node1 = family.getNode('1');
  const node2 = family.getNode('2');
  await Promise.all([node1.events.changed, node2.events.changed]);
  await flush();
  scenario(family.events.changed, onFamilyChanged);
  await node1.set('3');
  expect(onFamilyChanged.mock.calls.length).toBe(1);
  await node2.set('4');
  expect(onFamilyChanged.mock.calls.length).toBe(2);
});

test('throws if tries to re-assign node with existing id', async () => {
  const family = familyState((id) => `${id}-test`);
  family.setNode('1', state('test'));
  expect(family.setNode('1', state('another test'))).rejects.toEqual(
    new Error(`Cannot set node. Node with id "1" already exists.`),
  );
});

test('returns same node for the same key', async () => {
  const family = familyState((id) => `${id}-test`);
  const node1 = family.getNode('1');
  const node2 = family.getNode('1');
  expect(node1).toEqual(node2);
});

test('automatically assigns id when not provided', () => {
  expect(familyState(() => undefined).config.id).not.toBeUndefined();
});

test('applies custom config', () => {
  const { config } = familyState(() => undefined, {
    id: 'family-test',
    tags: ['awai', 'family-test'],
  });

  expect(config.id).toBe('family-test');
  expect(config.tags).toEqual([SystemTag.FAMILY_STATE, 'awai', 'family-test']);
});

test('allows passing custom properties in config', () => {
  const { config } = familyState(() => undefined, { lib: 'Awai' });
  expect(config).toMatchObject({ lib: 'Awai' });
});
