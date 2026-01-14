const isAbortSignal = (value: unknown): value is AbortSignal =>
  typeof AbortSignal !== 'undefined' && value instanceof AbortSignal;

export default isAbortSignal;
