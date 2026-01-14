import { expect, test, vi } from 'vitest';

import {
  Registry,
  SystemTag,
  asyncState,
  familyState,
  flush,
  registry,
  scenario,
  selector,
  state,
} from '../src';
import { getUniqueId } from '../src/lib';

test('has `events` and `nodes` property', () => {
  const registry = new Registry();

  expect(registry).toHaveProperty('events');
  expect(registry).toHaveProperty('nodes');
});

test('registers nodes in global registry', async () => {
  const onRegister = vi.fn();

  const counterScenario = scenario(registry.events.registered, onRegister);

  const state1 = state<string>('Hi');
  const state2 = asyncState<string>('Hi');
  const family = familyState(() => 'test');
  const selectedState = selector([state1, state2], (value1, value2) => value1 + value2);

  await flush();

  expect(registry.nodes).toContain(state1);
  expect(registry.nodes).toContain(state2);
  expect(registry.nodes).toContain(family);
  expect(registry.nodes).toContain(selectedState);
  expect(registry.nodes).toContain(counterScenario);

  expect(onRegister.mock.calls.length).toBeGreaterThan(1);
});

test('does not register nodes with SystemTag.CORE_NODE tag in registry', async () => {
  const previousRegistryNodes = registry.nodes;

  state<string>('Hi', { tags: [SystemTag.CORE_NODE] });
  asyncState<string>('Hi', { tags: [SystemTag.CORE_NODE] });
  await flush();

  expect(registry.nodes).toStrictEqual(previousRegistryNodes);
});

test('supports node deregistration', async () => {
  const state1 = state(0);
  await flush();
  expect(registry.nodes).include(state1);
  registry.deregister(state1.config.id);
  expect(registry.nodes).not.includes(state1);
});

test('emits `deregistered` event', async () => {
  const state1 = state(0);

  setTimeout(() => registry.deregister(state1.config.id), 10);

  const id = await registry.events.deregistered;
  expect(registry.nodes).not.includes(state1);
  expect(id).toBe(state1.config.id);
});

test('does nothing if node is not found', async () => {
  const id = getUniqueId();
  const nodes = registry.nodes;
  await registry.deregister(id);
  expect(registry.nodes).toStrictEqual(nodes);
});
