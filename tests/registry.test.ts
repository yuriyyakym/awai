import {
  Registry,
  asyncState,
  familyState,
  flush,
  registry,
  scenarioOnEvery,
  selector,
  state,
} from '../src';

describe('registry', () => {
  it('has `events` and `nodes` property', () => {
    const registry = new Registry();

    expect(registry).toHaveProperty('events');
    expect(registry).toHaveProperty('nodes');
  });

  it('registers nodes in global registry', async () => {
    let registeredEventsCount = 0;

    scenarioOnEvery(registry.events.registered, (node) => {
      registeredEventsCount++;
    });

    const state1 = state<string>('Hi');
    const state2 = asyncState<string>('Hi');
    const family = familyState(() => 'test');
    const innerFamilyState = family.getNode('some-id');
    const selectedState = selector([state1, state2], (value1, value2) => value1 + value2);

    await flush();

    expect(registry.nodes).toHaveLength(5);
    expect(registry.nodes).toContain(state1);
    expect(registry.nodes).toContain(state2);
    expect(registry.nodes).toContain(family);
    expect(registry.nodes).toContain(innerFamilyState);
    expect(registry.nodes).toContain(selectedState);

    expect(registeredEventsCount).toEqual(5);
  });
});
