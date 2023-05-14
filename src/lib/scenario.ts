const scenario = async (flowFn: () => Promise<any>) => {
  while (true) {
    await flowFn().catch(() => undefined);
  }
};

export default scenario;
