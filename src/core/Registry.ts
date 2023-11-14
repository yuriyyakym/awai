import { isCoreNode } from '../lib';
import type BaseNode from '../types/BaseNode';

import AwaiEvent from './AwaiEvent';

export default class Registry<T extends BaseNode> {
  private _nodes: T[] = [];
  public readonly events = {
    registered: new AwaiEvent<T>(),
  };

  public async register(node: T) {
    if (isCoreNode(node)) {
      return;
    }

    this._nodes.push(node);
    this.events.registered.emit(node);
  }

  get nodes() {
    return [...this._nodes];
  }
}
