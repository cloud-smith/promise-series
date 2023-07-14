export const dummyTask = ({ delay, shouldFail, state }: {
  delay: number;
  shouldFail?: Boolean;
  state?: any;
}) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (state) console.log(state);
    if (shouldFail) reject(`Task Failed`);
    else resolve(`Task Success`);
  }, delay);
});
