import isFunction from './isFunction';
import isPromiseLike from './isPromiseLike';

const isPromiseOrFunction = <T>(
  value: unknown,
): value is Promise<T> | ((...args: any) => Promise<T>) =>
  isFunction(value) || isPromiseLike<T>(value);

export default isPromiseOrFunction;
