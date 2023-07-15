import { promiseSeries } from '../promiseSeries';
import { dummyTask } from '../dummyTask';

it('should run array series', async () => {
  const results = await promiseSeries({
		tasks: [
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
		],
	});
	expect(results).toStrictEqual({
    "task-1": "Task Success",
    "task-2": "Task Success",
    "task-3": "Task Success",
  });
});

it('should test array series error handling', async () => {
  expect.assertions(1);
  try {
    await promiseSeries({
      tasks: [
        () => dummyTask({ delay: 100 }),
        () => dummyTask({ delay: 100, shouldFail: true }),
        () => dummyTask({ delay: 100 }),
      ],
    });
  } catch (error) {
    expect(error).toStrictEqual("Task Failed");
  }
});
