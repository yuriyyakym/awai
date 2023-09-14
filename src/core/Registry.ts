import type { BaseConfig } from '../types';

import AwaitableEvent from './AwaitableEvent';

export type Node = {
  config: BaseConfig;
  events: Record<string, AwaitableEvent<any>>;
};

export default class Registry<T extends Node> {
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
