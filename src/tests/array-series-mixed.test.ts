import { promiseSeries, dummyTask } from '../';

it('should run mixed task types using an array', async () => {
  const results = await promiseSeries({
    useLogging: false,
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
	expect(JSON.stringify(results)).toStrictEqual(
    "{\"isTasksSuccessful\":true,\"isRollbacksSuccessful\":false,\"errors\":{\"tasks\":[],\"rollbacks\":[]},\"tasks\":[{\"number\":1,\"name\":\"task-1\",\"results\":\"Task Success\"},{\"number\":2,\"name\":\"task-2\",\"results\":\"Task Success\"},{\"number\":3,\"name\":\"task-3\",\"results\":\"Task Success\"},{\"number\":4,\"name\":\"task-4\",\"results\":\"non-async task success\"}],\"rollbacks\":[]}"
  );
});