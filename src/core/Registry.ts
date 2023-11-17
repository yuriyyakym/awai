import { isCoreNode } from '../lib';
import type BaseNode from '../types/BaseNode';

import AwaiEvent from './AwaiEvent';

export default class Registry<T extends BaseNode> {
  private _nodes: T[] = [];
  public readonly events = {
    deregistered: new AwaiEvent<T['config']['id']>(),
    registered: new AwaiEvent<T>(),
  };

  public async register(node: T) {
    if (isCoreNode(node)) {
      return;
    }

    this._nodes.push(node);
    this.events.registered.emit(node);
  }

  public async deregister(id: BaseNode['config']['id']) {
    const node = this._nodes.find((node) => node.config.id === id);

    if (!node) {
      return;
    }

    this._nodes = this._nodes.filter((node) => node.config.id !== id);
    this.events.deregistered.emit(id);
  }

  get nodes() {
    return [...this._nodes];
  }
}
