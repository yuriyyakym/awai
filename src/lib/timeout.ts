const timeout = (ms: number): Promise<void> => {
  return new Promise((_, reject) => setTimeout(reject, ms));
};

export default timeout;
