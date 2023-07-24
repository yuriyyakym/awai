export default interface AsyncValue<T> {
  error: unknown;
  isLoading: boolean;
  value: T | undefined;
}
