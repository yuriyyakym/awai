const scenario = async (scenarioFn: () => Promise<any>) => {
  while (true) {
    await scenarioFn().catch(() => undefined);
  }
};

export default scenario;
