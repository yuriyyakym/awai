type Setter<T> = (nextValueOrResolver: T | ((current: T) => T)) => Promise<T>;

export default Setter;
