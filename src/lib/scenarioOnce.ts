import noop from './noop';

const scenarioOnce = (scenarioFn: () => Promise<any>) => {
  scenarioFn().catch(noop);
};

export default scenarioOnce;
