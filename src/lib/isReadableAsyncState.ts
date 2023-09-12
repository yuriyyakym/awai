import type { ReadableAsyncState } from '../types';

import isFunction from './isFunction';
import isObject from './isObject';

const isReadableAsyncState = <T>(value: unknown): value is ReadableAsyncState<T> =>
  isObject(value) &&
  isFunction(value.get) &&
  isFunction(value.getAsync) &&
  isFunction(value.getPromise) &&
  isFunction(value.then);

export default isReadableAsyncState;
