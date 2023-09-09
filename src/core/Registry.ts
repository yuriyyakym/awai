import AwaitableEvent from './AwaitableEvent';

export type Node = {
  events: Record<string, AwaitableEvent<any>>;
};

export default class Registry {
  private _nodes: Node[] = [];
  public readonly events = {
    registered: new AwaitableEvent<Node>(),
  };

  public async register(node: Node) {
    this._nodes.push(node);
    this.events.registered.emit(node);
  }

  get nodes() {
    return [...this._nodes];
  }
}
