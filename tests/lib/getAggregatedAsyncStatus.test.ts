import { expect, test } from 'vitest';

import { AsyncStatus, asyncState, delay, flush, getAggregatedAsyncStatus, state } from '../../src';

test('returns `REJECTED` status if any async node has error', async () => {
  const syncTestState = state('Test');
  const asyncTestState = asyncState('Test');
  const rejectedState = asyncState(() => Promise.reject(''));

  await flush();

  expect(getAggregatedAsyncStatus([syncTestState, asyncTestState, rejectedState])).toEqual(
    AsyncStatus.REJECTED,
  );
});

test('returns `FULFILLED` status if all states are fulfilled', async () => {
  const syncTestState = state('Test');
  const asyncTestState = asyncState('Test');

  await flush();

  expect(getAggregatedAsyncStatus([syncTestState, asyncTestState])).toEqual(AsyncStatus.FULFILLED);
});

test('returns `PENDING` status if any state is pending', async () => {
  const syncTestState = state('Test');
  const asyncTestState = asyncState(() => delay(10).then(() => 'Test'));

  await flush();

  expect(getAggregatedAsyncStatus([syncTestState, asyncTestState])).toEqual(AsyncStatus.PENDING);
});
