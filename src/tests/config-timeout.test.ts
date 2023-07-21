import { promiseSeries } from '../promiseSeries';
import { dummyTask } from '../dummyTask';

it('should run array series with a timeout', async () => {
  const results = await promiseSeries({
    config: {
      timeout: 1000,
    },
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

it('should fail array series with a timeout', async () => {
  expect.assertions(1);
  try {
    await promiseSeries({
      config: {
        timeout: 1000,
      },
      tasks: [
        () => dummyTask({ delay: 100 }),
        () => dummyTask({ delay: 1500 }),
        () => dummyTask({ delay: 100 }),
      ],
    });
  } catch (error) {
    expect(error).toStrictEqual("Timed out");
  }
});
