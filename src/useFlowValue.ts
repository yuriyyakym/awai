import { useEffect, useState } from 'react';

import State from './State';

const useFlowValue = <T>(flowState: State<T>): T => {
  const [state, setState] = useState<T>(flowState.value);

  useEffect(() => {
    let mounted = true;

    queueMicrotask(async () => {
      while (mounted) {
        /**
         * @todo Cleanup on unmount
         * @url https://github.com/yuriyyakym/flow-store/issues/1
         */
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

  return state;
};

export default useFlowValue;
