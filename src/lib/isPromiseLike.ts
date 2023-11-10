import isFunction from './isFunction';
import isObject from './isObject';

const isPromiseLike = <T>(value: unknown): value is PromiseLike<T> =>
  isObject(value) && (value instanceof Promise || isFunction(value.then));

export default isPromiseLike;
