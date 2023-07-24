type AsyncSetter<T> = (
  nextValueOrResolver: T | Promise<T> | ((current?: T | undefined) => T | Promise<T>),
) => void;

export default AsyncSetter;
