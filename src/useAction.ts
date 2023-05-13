import Action from './Action';

const useAction =
  <Callback extends (...args: any) => any, A extends Action<Callback>>(action: A) =>
  (...args: Parameters<Callback>) =>
    action.call(...args);

export default useAction;
