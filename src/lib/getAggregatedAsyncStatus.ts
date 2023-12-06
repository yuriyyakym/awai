import { AsyncStatus } from '../constants';
import type { ReadableAsyncState } from '../types';

const getAggregatedAsyncStatus = <T extends Pick<ReadableAsyncState, 'getStatus'>[]>(
  states: T,
): AsyncStatus => {
  const hasError = states.some((state) => state.getStatus() === AsyncStatus.REJECTED);

  if (hasError) {
    return AsyncStatus.REJECTED;
  }

  const isPending = states.some((state) => state.getStatus() === AsyncStatus.PENDING);

  if (isPending) {
    return AsyncStatus.PENDING;
  }

  return AsyncStatus.FULFILLED;
};

export default getAggregatedAsyncStatus;
