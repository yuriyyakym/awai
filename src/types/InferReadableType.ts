import ReadableAsyncState from './ReadableAsyncState';
import ReadableState from './ReadableState';

type InferReadableType<T> = T extends ReadableState<infer U>
  ? U
  : T extends ReadableAsyncState<infer Q>
  ? Q
  : unknown;

export default InferReadableType;
