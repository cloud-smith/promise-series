import { promiseSeries } from '../promiseSeries';
import { dummyTask } from '../dummyTask';

it('should run named array series', async () => {
  const results = await promiseSeries({
		tasks: {
      getApples: () => dummyTask({ delay: 100 }),
      getOrganges: () => dummyTask({ delay: 100 }),
      getGrapes: () => dummyTask({ delay: 100 }),
    },
	});
	expect(results).toStrictEqual({
    "getApples": "Task Success",
    "getOrganges": "Task Success",
    "getGrapes": "Task Success",
  });
});

it('should fail named series', async () => {
  expect.assertions(1);
  try {
    await promiseSeries({
      tasks: {
        getApples: () => dummyTask({ delay: 100 }),
        getOrganges: () => dummyTask({ delay: 100, shouldFail: true }),
        getGrapes: () => dummyTask({ delay: 100 }),
      },
    });
  } catch (error) {
    expect(error).toStrictEqual("Task Failed");
  }
});
