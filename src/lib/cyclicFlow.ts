const cyclicFlow = async (flowFn: () => Promise<any>, config: any) => {
  while (true) {
    await flowFn().catch(() => undefined);
  }
};

export default cyclicFlow;
