const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export default flush;
