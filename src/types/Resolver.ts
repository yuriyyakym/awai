type Resolver<T> = (value: T) => T | Resolver<T>;

export default Resolver;
