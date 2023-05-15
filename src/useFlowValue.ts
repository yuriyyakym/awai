import { useEffect, useState } from 'react';

import { State } from './state';

const useFlowValue = <T>(flowState: State<T>): T => {
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

  return state;
};

export default useFlowValue;
