import isObject from './isObject';

const isPromiseLike = <T>(value: any): value is PromiseLike<T> =>
  isObject(value) && (value instanceof Promise || value.then instanceof Function);

export default isPromiseLike;
