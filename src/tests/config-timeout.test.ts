import { promiseSeries } from '../promiseSeries';
import { dummyTask } from '../dummyTask';

it('should run array series with a timeout', async () => {
  const results = await promiseSeries({
    timeout: 1000,
		tasks: [
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
		],
	});
	expect(JSON.stringify(results)).toStrictEqual(
    `[{\"number\":1,\"name\":\"task-1\",\"results\":\"Task Success\"},{\"number\":2,\"name\":\"task-2\",\"results\":\"Task Success\"},{\"number\":3,\"name\":\"task-3\",\"results\":\"Task Success\"}]`
  );
});

it('should fail array series with a timeout', async () => {
  expect.assertions(1);
  try {
    await promiseSeries({
      timeout: 1000,
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
