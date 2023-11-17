import { AsyncStatus } from '../constants';
import type { ReadableAsyncState, ReadableState } from '../types';

import isReadableAsyncState from './isReadableAsyncState';

const getAggregatedAsyncStatus = <
  T extends (ReadableState<any> | ReadableAsyncState<any> | Promise<any>)[],
>(
  states: T,
): AsyncStatus => {
  const asyncStates = states.filter(isReadableAsyncState);

  const hasError = asyncStates.some((state) => state.getStatus() === AsyncStatus.FAILURE);

  if (hasError) {
    return AsyncStatus.FAILURE;
  }

  const hasLoading = asyncStates.some((state) => state.getStatus() === AsyncStatus.LOADING);

  if (hasLoading) {
    return AsyncStatus.LOADING;
  }

  return AsyncStatus.LOADED;
};

export default getAggregatedAsyncStatus;
