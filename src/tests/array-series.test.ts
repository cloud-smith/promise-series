import { promiseSeries, dummyTask } from '../';

it('should run array series', async () => {
  const results = await promiseSeries({
		tasks: [
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
		],
	});
	expect(JSON.stringify(results)).toStrictEqual(
    "[{\"number\":1,\"name\":\"task-1\",\"results\":\"Task Success\"},{\"number\":2,\"name\":\"task-2\",\"results\":\"Task Success\"},{\"number\":3,\"name\":\"task-3\",\"results\":\"Task Success\"}]"
  );
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
    expect(JSON.stringify(error)).toStrictEqual("{\"number\":2,\"name\":\"task-2\",\"error\":\"Task simulated failure\"}");
  }
});
