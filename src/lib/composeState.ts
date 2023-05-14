import state, { State } from '../state';

const composeState = <T extends any[], U>(
  states: [...{ [K in keyof T]: State<T[K]> }],
  predicate: (...values: { [K in keyof T]: T[K] }) => U,
): State<U> & { dispose: () => void } => {
  const values = states.map((state) => state.get()) as { [K in keyof T]: T[K] };
  const composedState = state(predicate(...values));
  let mounted = true;

  queueMicrotask(async () => {
    while (mounted) {
      /**
       * @todo Cleanup when disposed
       * @todo Consider weakRefs
       * @see https://github.com/yuriyyakym/flow-store/issues/1
       */
      await Promise.race(states.map((state) => state.events.changed));
      const values = states.map((state) => state.get()) as { [K in keyof T]: T[K] };
      composedState.set(predicate(...values));
    }
  });

  const dispose = () => {
    mounted = false;
  };

  return Object.assign(composedState, { dispose });
};

export default composeState;
