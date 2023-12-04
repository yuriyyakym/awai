import { AsyncStatus } from '../constants';
import type { ReadableAsyncState, ReadableState } from '../types';

import isReadableAsyncState from './isReadableAsyncState';

const getAggregatedAsyncStatus = <
  T extends (ReadableState<any> | ReadableAsyncState<any> | Promise<any>)[],
>(
  states: T,
): AsyncStatus => {
  const asyncStates = states.filter(isReadableAsyncState);

  const hasError = asyncStates.some((state) => state.getStatus() === AsyncStatus.REJECTED);

  if (hasError) {
    return AsyncStatus.REJECTED;
  }

  const isPending = asyncStates.some((state) => state.getStatus() === AsyncStatus.PENDING);

  if (isPending) {
    return AsyncStatus.PENDING;
  }

  return AsyncStatus.FULFILLED;
};

export default getAggregatedAsyncStatus;
