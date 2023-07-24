import { ReadableState, WritableState } from '../types';

export type Setter<T> = (nextValueOrResolver: T | ((current: T) => T)) => Promise<T>;

export type State<T> = ReadableState<T> & WritableState<T>;
