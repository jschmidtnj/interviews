export const updateTime = 10000; // ms

const sleep = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

export default sleep;
