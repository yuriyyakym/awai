import { AsyncStatus, ReadableAsyncState, ReadableState, isReadableAsyncState } from '../../types';

const getCommonStatus = <T extends (ReadableState<any> | ReadableAsyncState<any>)[]>(
  states: T,
): AsyncStatus => {
  const asyncStates = states.filter(isReadableAsyncState);

  const hasError = asyncStates.find((state) => state.getStatus() === AsyncStatus.FAILURE);

  if (hasError) {
    return AsyncStatus.FAILURE;
  }

  const hasLoading = asyncStates.find((state) => state.getStatus() === AsyncStatus.LOADING);

  if (hasLoading) {
    return AsyncStatus.LOADING;
  }

  return AsyncStatus.LOADED;
};

export default getCommonStatus;
