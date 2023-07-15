# Promise Series
A Javascript promise-series function utility.

## Installtion
With NPM
```
npm i @cloud-smith/promise-series
```
With Yarn
```
yarn install @cloud-smith/promise-series
```

## Example

```
import { promiseSeries } from '@cloud-smith/promise-series';

const tasks = [
  () => dummyTask({ name: 'Task 1', delay: 500 }),
  () => dummyTask({ name: 'Task 2', delay: 500 }),
  () => dummyTask({ name: 'Task 3', delay: 500 }),
];

await promiseSeries(tasks)
  .then(console.log);
  .catch(console.error)
```

## The Dummy Function
For demonstration, we can use a dummy promises that succeeds or fails after a delay, just like a real fetch request.

```
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
```

It's possible to import with
```
import { dummyTask } from '@cloud-smith/promise-series';
```

## Usage

### Array Series
```
const tasks = [
  () => dummyTask({ delay: 500 }),
  () => dummyTask({ delay: 500 }),
  () => dummyTask({ delay: 500 }),
];

await promiseSeries({ tasks })
  .then(console.log)
  .catch(console.error);
```

### Named Array Series
```
const tasks = {
  getApples: () => dummyTask({ delay: 500 }),
  getOrganges: () => dummyTask({ delay: 500 }),
  getGrapes: () => dummyTask({ delay: 500 }),
};

await promiseSeries({ tasks })
  .then(console.log)
  .catch(console.error);
```

### Mixed task types
```
const tasks = [
  () => dummyTask({ delay: 500 }),
  () => dummyTask({ delay: 500 }),
  () => dummyTask({ delay: 500 }),
  () => {
    console.log('non-async task testing');
  }
];

await promiseSeries({ tasks })
  .then(console.log)
  .catch(console.error);
```

### Getting state changes
```
const tasks = [
  () => dummyTask({ delay: 500 }),
  () => dummyTask({ delay: 500 }),
  () => dummyTask({ delay: 500 }),
];

const onStateChange = stateUpdate => console;

await promiseSeries({
  tasks,
  onStateChange,
})
  .then(console.log)
  .catch(console.error);
```

### Passing state between tasks
```
const tasks = [
  state => dummyTask({ delay: 500, state }),
  state => dummyTask({ delay: 500, state }),
  state => dummyTask({ delay: 500, state }),
];

await promiseSeries({ tasks })
  .then(console.log)
  .catch(console.error);
```

### Configuration
```
const config = {
  useLogging: true,
};

const tasks = [
  () => dummyTask({ delay: 500 }),
  () => dummyTask({ delay: 500 }),
  () => dummyTask({ delay: 500 }),
];

await promiseSeries({ config, tasks })
  .then(console.log)
  .catch(console.error);
```