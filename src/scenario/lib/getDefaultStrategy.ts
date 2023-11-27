import type { Config } from '../types';

const getDefaultStrategy = (
  isPlainPromiseTrigger: boolean,
  hasTrigger: boolean,
): Config['strategy'] => {
  if (isPlainPromiseTrigger) {
    return 'once';
  }

  if (hasTrigger) {
    return 'fork';
  }

  return 'cyclic';
};

export default getDefaultStrategy;
