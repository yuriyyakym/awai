import { ReadableState, WritableState } from '../types';

export type State<T> = ReadableState<T> & WritableState<T>;
