import { promiseSeries } from '../promiseSeries';
import { dummyTask } from '../dummyTask';

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
	expect(results).toStrictEqual({
    "getApples": "Task Success",
    "getOrganges": "Task Success",
    "getGrapes": "Task Success",
    "getNoneAsync": "non-async task success"
  });
});
