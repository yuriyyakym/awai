const cyclicFlow = async (flowFn: () => Promise<any>) => {
  while (true) {
    await flowFn().catch(() => undefined);
  }
};

export default cyclicFlow;
