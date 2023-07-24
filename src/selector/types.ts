import { Disposable, ReadableAsyncState, ReadableState } from '../types';

export type SyncSelector<T> = ReadableState<T> & Disposable;

export type AsyncSelector<T> = ReadableAsyncState<T> & Disposable;
