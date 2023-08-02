import { promiseSeries, dummyTask } from '../';

it('should run array series', async () => {
  const results = await promiseSeries({
    useLogging: false,
		tasks: [
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
		],
	});
	expect(JSON.stringify(results)).toStrictEqual(
    "{\"isTasksSuccessful\":true,\"isRollbacksSuccessful\":false,\"errors\":{\"tasks\":[],\"rollbacks\":[]},\"tasks\":[{\"number\":1,\"name\":\"task-1\",\"results\":\"Task Success\"},{\"number\":2,\"name\":\"task-2\",\"results\":\"Task Success\"},{\"number\":3,\"name\":\"task-3\",\"results\":\"Task Success\"}],\"rollbacks\":[]}"
  );
});

it('should test array series error handling', async () => {
  expect.assertions(1);
  try {
    await promiseSeries({
      useLogging: false,
      tasks: [
        () => dummyTask({ delay: 100 }),
        () => dummyTask({ delay: 100, shouldFail: true }),
        () => dummyTask({ delay: 100 }),
      ],
    });
  } catch (error) {
    expect(JSON.stringify(error)).toStrictEqual(
      "{\"isTasksSuccessful\":false,\"isRollbacksSuccessful\":false,\"errors\":{\"tasks\":[{\"number\":2,\"name\":\"task-2\",\"error\":\"Task simulated failure\"}],\"rollbacks\":[]},\"tasks\":[{\"number\":1,\"name\":\"task-1\",\"results\":\"Task Success\"},{\"number\":2,\"name\":\"task-2\",\"error\":\"Task simulated failure\"},{\"number\":3,\"name\":\"task-3\"}],\"rollbacks\":[]}"
    );
  }
});
