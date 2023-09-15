import type { AwaitableEvent } from '../core';

import type BaseConfig from './BaseConfig';

export default interface BaseNode {
  config: BaseConfig;
  events: Record<string, AwaitableEvent<any>>;
}
