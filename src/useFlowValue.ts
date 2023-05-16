import { useEffect, useState } from 'react';

import { State } from './state';

const useFlowValue = <T>(flowState: State<T>): T => {
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

  return state;
};

export default useFlowValue;
