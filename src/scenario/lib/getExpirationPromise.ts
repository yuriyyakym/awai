import type { ShouldExpirePredicate, UntilTrigger } from '../types';

const getExpirationPromise = <E>(until: Exclude<UntilTrigger<E>, ShouldExpirePredicate>) => {
  if (typeof AbortSignal !== 'undefined' && until instanceof AbortSignal) {
    return new Promise((resolve) => {
      until.addEventListener('abort', () => resolve(undefined), { once: true });
    });
  }

  return Promise.resolve(until) as Promise<E>;
};

export default getExpirationPromise;
