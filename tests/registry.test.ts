import { expect, test, vi } from 'vitest';

import {
  Registry,
  asyncState,
  familyState,
  flush,
  registry,
  scenario,
  selector,
  state,
} from '../src';

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
  const innerFamilyState = family.getNode('some-id');
  const selectedState = selector([state1, state2], (value1, value2) => value1 + value2);

  await flush();

  expect(registry.nodes).toContain(state1);
  expect(registry.nodes).toContain(state2);
  expect(registry.nodes).toContain(family);
  expect(registry.nodes).toContain(innerFamilyState);
  expect(registry.nodes).toContain(selectedState);
  expect(registry.nodes).toContain(counterScenario);

  expect(onRegister.mock.calls.length).toBeGreaterThan(1);
});
