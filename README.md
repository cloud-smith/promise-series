# promise-series
Javascript promise-series function

## Installtion
Coming soon, awaiting publish.


NPM
```
npm install promise-series --save
```
Yarn
```
yarn install promise-series
```

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

## Usage

### Array Series
```
import { promiseSeries } from 'promise-series';

const handler = async () => {
  const tasks = [
    () => dummyTask({ delay: 500 }),
    () => dummyTask({ delay: 500 }),
    () => dummyTask({ delay: 500 }),
  ];

  await promiseSeries({ tasks })
    .then(console.log)
    .catch(console.error);
};
```

### Named Array Series
```
const handler = async () => {
  const tasks = {
    getApples: () => dummyTask({ delay: 500 }),
    getOrganges: () => dummyTask({ delay: 500 }),
    getGrapes: () => dummyTask({ delay: 500 }),
  };

  await promiseSeries({ tasks })
    .then(console.log)
    .catch(console.error);
};
```

### Mixed task types
```
import { promiseSeries } from 'promise-series';

const handler = async () => {
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
};
```

### Dummy promise (async example)
For demonstration, we can use a dummy promises that succeeds or fails after a delay, just like a real fetch request.
```
const dummyTask = ({ delay, shouldFail, state }: {
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

### Getting state changes
```
const handler = async () => {
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
};
```

### Passing state between tasks
```
const handler = async () => {
  const tasks = [
    state => dummyTask({ delay: 500, state }),
    state => dummyTask({ delay: 500, state }),
    state => dummyTask({ delay: 500, state }),
  ];

  await promiseSeries({ tasks })
    .then(console.log)
    .catch(console.error);
};
```

### Configuration
```
const handler = async () => {
  const config = {
    useLogging: true,
    useLogger: console,
  };

  const tasks = [
    () => dummyTask({ delay: 500 }),
    () => dummyTask({ delay: 500 }),
    () => dummyTask({ delay: 500 }),
  ];

  await promiseSeries({ config, tasks })
    .then(console.log)
    .catch(console.error);
};
```