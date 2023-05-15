import { useCallback, useEffect, useState } from 'react';

import { State } from './state';

const useFlowState = <T>(flowState: State<T>): [T, (newValue: T) => void] => {
  const [state, setState] = useState<T>(flowState.get);

  useEffect(() => {
    let mounted = true;

    queueMicrotask(async () => {
      while (mounted) {
        /**
         * @todo Cleanup on unmount
         * @url https://github.com/yuriyyakym/flow-store/issues/1
         */
        await flowState.events.changed;
        if (mounted) {
          setState(flowState.get());
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [flowState]);

  const setValue = useCallback(
    (newState: T) => {
      flowState.set(newState);
    },
    [flowState],
  );

  return [state, setValue];
};

export default useFlowState;
