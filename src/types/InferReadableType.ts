import ReadableAsyncState from './ReadableAsyncState';
import ReadableState from './ReadableState';

type InferReadableType<T> = T extends ReadableState<infer U> | ReadableAsyncState<infer U>
  ? U
  : unknown;

export default InferReadableType;
