import { promiseSeries } from '../promiseSeries';
import { dummyTask } from './dummyTask';

it('should run mixed task types using an array', async () => {
  const results = await promiseSeries({
		tasks: [
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
      () => {
        const result = 'non-async task success';
        console.log(result);
        return result;
      }
		],
	});
	expect(results).toStrictEqual({
    "task-1": "Task Success",
    "task-2": "Task Success",
    "task-3": "Task Success",
    "task-4": "non-async task success"
  });
});