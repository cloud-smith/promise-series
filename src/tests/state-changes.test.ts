import { promiseSeries, dummyTask } from '../';

it('should return state changes', async () => {
  const states = [];
  let statesWithoutTasks = [];

  await promiseSeries({
    useLogging: false,
		tasks: [
			() => dummyTask({ delay: 100 }),
		],
    onStateChange: update => states.push(update),
	});

  statesWithoutTasks = states.map(state => {
    const parsed = { ...state };
    delete(parsed.tasks);
    return parsed;
  });

	expect(JSON.stringify(statesWithoutTasks)).toStrictEqual(
    "[{\"isTasksSuccessful\":false,\"isRollbacksSuccessful\":false,\"errors\":{\"tasks\":[],\"rollbacks\":[]},\"rollbacks\":[],\"config\":{\"useLogging\":false,\"timeout\":30000,\"forceParallelRollbacks\":false,\"forceRollbacks\":false},\"current\":{}},{\"isTasksSuccessful\":false,\"isRollbacksSuccessful\":false,\"errors\":{\"tasks\":[],\"rollbacks\":[]},\"rollbacks\":[],\"config\":{\"useLogging\":false,\"timeout\":30000,\"forceParallelRollbacks\":false,\"forceRollbacks\":false},\"current\":{\"taskLabel\":\"task 1 of 1 \\\"task-1\\\"\",\"task\":{\"number\":1,\"name\":\"task-1\"}}},{\"isTasksSuccessful\":true,\"isRollbacksSuccessful\":false,\"errors\":{\"tasks\":[],\"rollbacks\":[]},\"rollbacks\":[],\"config\":{\"useLogging\":false,\"timeout\":30000,\"forceParallelRollbacks\":false,\"forceRollbacks\":false},\"current\":{\"taskLabel\":\"task 1 of 1 \\\"task-1\\\"\",\"task\":{\"number\":1,\"name\":\"task-1\"}}}]"
  );
});
