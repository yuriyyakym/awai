import type { BaseNode } from '../types';

import AwaitableEvent from './AwaitableEvent';

export default class Registry<T extends BaseNode> {
  private _nodes: T[] = [];
  public readonly events = {
    registered: new AwaitableEvent<T>(),
  };

  public async register(node: T) {
    this._nodes.push(node);
    this.events.registered.emit(node);
  }

  get nodes() {
    return [...this._nodes];
  }
}
