/**
 * @description
 * This helper is needed to emit events synchronously, so that scenarios/effects/selectors
 * can resubscribe to an event before another emission.
 *
 * @example
 * const state = state(0);
 *
 * scenarioOnEvery(state.events.change, () => {
 *  // Without `SyncQueue` this scenario would only run once
 * });
 *
 * state.set(1);
 * state.set(2);
 */

export default class SyncQueue {
  private callbacksQueue: Function[] = [];
  private isDequeuing = false;

  public enqueue(callback: Function) {
    this.callbacksQueue.push(callback);
    this.dequeue();
  }

  private dequeue = async () => {
    if (this.isDequeuing || this.callbacksQueue.length === 0) {
      return;
    }

    this.isDequeuing = true;
    const callback = this.callbacksQueue.shift()!;
    callback();

    queueMicrotask(() => {
      this.isDequeuing = false;
      this.dequeue();
    });
  };
}
