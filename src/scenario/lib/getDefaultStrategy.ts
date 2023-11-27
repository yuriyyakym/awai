import type { Config } from '../types';

const getDefaultStrategy = (
  isPlainPromiseTrigger: boolean,
  hasDependencies: boolean,
): Config['strategy'] => {
  if (isPlainPromiseTrigger) {
    return 'once';
  }

  if (hasDependencies) {
    return 'fork';
  }

  return 'cyclic';
};

export default getDefaultStrategy;
