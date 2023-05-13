import State from '../State';

const composeState = <T extends any[], U>(
  states: [...{ [K in keyof T]: State<T[K]> }],
  predicate: (...values: { [K in keyof T]: T[K] }) => U,
): State<U> & { dispose: () => void } => {
  const values = states.map((state) => state.value) as { [K in keyof T]: T[K] };
  const composedState = new State(predicate(...values));
  let mounted = true;

  queueMicrotask(async () => {
    while (mounted) {
      /**
       * @todo Cleanup when disposed
       * @see https://github.com/yuriyyakym/flow-store/issues/1
       */
      await Promise.race(states.map((state) => state.changed));
      const values = states.map((state) => state.value) as { [K in keyof T]: T[K] };
      composedState.setValue(predicate(...values));
    }
  });

  const dispose = () => {
    mounted = false;
  };

  return Object.assign(composedState, { dispose });
};

export default composeState;
