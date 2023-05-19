const fork = async (forkFn: () => Promise<any>) => {
  await forkFn();
};

export default fork;
