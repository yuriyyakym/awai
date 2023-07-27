import ReadableAsyncState from './ReadableAsyncState';
import ReadableState from './ReadableState';

type InferReadableType<T> = T extends ReadableAsyncState<infer U>
  ? U
  : T extends ReadableState<infer Q>
  ? Q
  : unknown;

export default InferReadableType;
