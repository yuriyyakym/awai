import { Disposable, ReadableAsyncState, WritableAsyncState } from '../types';

export type InitialValue<T> = T | Promise<T> | (() => Promise<T>);

export type AsyncState<T> = ReadableAsyncState<T> & WritableAsyncState<T>;
