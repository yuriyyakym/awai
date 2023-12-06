import { expect, test } from 'vitest';

import { AsyncStatus, asyncState, delay, flush, getAggregatedAsyncStatus } from '../../src';

test('returns `REJECTED` status if any async node has error', async () => {
  const asyncTestState = asyncState('Test');
  const rejectedState = asyncState(() => Promise.reject(''));

  await flush();

  expect(getAggregatedAsyncStatus([asyncTestState, rejectedState])).toEqual(AsyncStatus.REJECTED);
});

test('returns `FULFILLED` status if all states are fulfilled', async () => {
  const state1 = asyncState('Test 1');
  const state2 = asyncState('Test 2');

  await flush();

  expect(getAggregatedAsyncStatus([state1, state2])).toEqual(AsyncStatus.FULFILLED);
});

test('returns `PENDING` status if any state is pending', async () => {
  const state1 = asyncState(() => delay(10).then(() => 'Test 1'));
  const state2 = asyncState('Test 2');

  await flush();

  expect(getAggregatedAsyncStatus([state1, state2])).toEqual(AsyncStatus.PENDING);
});
