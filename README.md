# promise-series
Javascript promise-series function

## Example

```
import { promiseSeries } from 'promise-series';

const dummyTask = ({ name, delay, shouldFail }: {
  name: string;
  delay: number;
  shouldFail?: Boolean;
}) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (shouldFail) reject(`${name} Failed`);
    else resolve(`${name} Success`);
  }, delay);
});

const tasks = [
  () => dummyTask({ name: 'Task 1', delay: 500 }),
  () => dummyTask({ name: 'Task 2', delay: 500 }),
  () => dummyTask({ name: 'Task 3', delay: 500 }),
]; 

await promiseSeries(tasks)
  .then(console.log);
  .catch(console.error)
```
