import { promiseSeries, dummyTask } from '../';

it('should run array series with a timeout', async () => {
  const results = await promiseSeries({
    useLogging: false,
    timeout: 1000,
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

it('should fail array series with a timeout', async () => {
  expect.assertions(1);
  try {
    await promiseSeries({
      useLogging: false,
      timeout: 1000,
      tasks: [
        () => dummyTask({ delay: 100 }),
        () => dummyTask({ delay: 1500 }),
        () => dummyTask({ delay: 100 }),
      ],
    });
  } catch (error) {
    expect(JSON.stringify(error)).toStrictEqual(
      "{\"isTasksSuccessful\":false,\"isRollbacksSuccessful\":false,\"errors\":{\"tasks\":[{\"number\":2,\"name\":\"task-2\",\"error\":\"Task timed out\"}],\"rollbacks\":[]},\"tasks\":[{\"number\":1,\"name\":\"task-1\",\"results\":\"Task Success\"},{\"number\":2,\"name\":\"task-2\",\"error\":\"Task timed out\"},{\"number\":3,\"name\":\"task-3\"}],\"rollbacks\":[]}"
    );
  }
});
