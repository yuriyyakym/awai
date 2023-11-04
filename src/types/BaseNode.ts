import type { AwaiEvent } from '../core';

import type BaseConfig from './BaseConfig';

export default interface BaseNode {
  config: BaseConfig;
  events: Record<string, AwaiEvent<any>>;
}
