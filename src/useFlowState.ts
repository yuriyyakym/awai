import { useCallback, useEffect, useState } from 'react';

import { State } from './state';

const useFlowState = <T>(flowState: State<T>): [T, (newValue: T) => void] => {
  const [state, setState] = useState<T>(flowState.get);

  useEffect(() => {
    let mounted = true;

    (async () => {
      while (mounted) {
        /**
         * @todo Cleanup on unmount
         * @url https://github.com/yuriyyakym/flow-store/issues/1
         */
        const newValue = await flowState.events.changed;
        if (mounted) {
          setState(newValue);
        }
      }
    })();

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
