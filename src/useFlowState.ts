import { useCallback, useEffect, useState } from 'react';

import State from './State';

const useFlowState = <T>(flowState: State<T>): [T, (newValue: T) => void] => {
  const [state, setState] = useState<T>(flowState.value);

  useEffect(() => {
    let mounted = true;

    queueMicrotask(async () => {
      while (mounted) {
        await flowState.changed;
        if (mounted) {
          setState(flowState.value);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [flowState]);

  const setValue = useCallback(
    (newState: T) => {
      flowState.setValue(newState);
    },
    [flowState],
  );

  return [state, setValue];
};

export default useFlowState;
