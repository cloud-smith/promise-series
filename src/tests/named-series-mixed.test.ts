import { promiseSeries, dummyTask } from '../';

it('should run mixed task types using a named array', async () => {
  const results = await promiseSeries({
		tasks: {
      getApples: () => dummyTask({ delay: 100 }),
      getOrganges: () => dummyTask({ delay: 100 }),
      getGrapes: () => dummyTask({ delay: 100 }),
      getNoneAsync: () => {
        const result = 'non-async task success';
        console.log(result);
        return result;
      }
    },
	});
	expect(JSON.stringify(results)).toStrictEqual(
    "[{\"number\":1,\"name\":\"task-1\",\"results\":\"Task Success\"},{\"number\":2,\"name\":\"task-2\",\"results\":\"Task Success\"},{\"number\":3,\"name\":\"task-3\",\"results\":\"Task Success\"},{\"number\":4,\"name\":\"task-4\",\"results\":\"non-async task success\"}]"
  );
});
