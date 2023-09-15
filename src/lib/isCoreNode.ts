import { SystemTag } from '../constants';
import type { BaseNode } from '../types';

const isCoreNode = (node: BaseNode): boolean => node.config.tags.includes(SystemTag.CORE_NODE);

export default isCoreNode;
