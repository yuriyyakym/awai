import noop from './noop';

const flow = (flowFn: () => Promise<any>) => {
  flowFn().catch(noop);
};

export default flow;
