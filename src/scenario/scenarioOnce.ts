import { noop } from '../lib';

const scenarioOnce = (scenarioFn: () => Promise<any>) => {
  scenarioFn().catch(noop);
};

export default scenarioOnce;
