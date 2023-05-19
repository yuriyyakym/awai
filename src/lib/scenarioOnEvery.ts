import AwaitableEvent from './AwaitableEvent';
import noop from './noop';

const scenarioOnEvery = async <T>(
  awaitableEvent: AwaitableEvent<T>,
  scenarioFn: (event: T) => Promise<any>,
) => {
  while (true) {
    const event = await awaitableEvent;
    scenarioFn(event).catch(noop);
  }
};

export default scenarioOnEvery;
