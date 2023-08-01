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
    "[{\"config\":{\"useLogging\":false,\"timeout\":30000,\"faultTolerantRollbacks\":false},\"isRunning\":true,\"isComplete\":false,\"isTasksComplete\":false,\"isRollbacksComplete\":false,\"rollbacks\":[],\"current\":{},\"errors\":{\"tasks\":[],\"rollbacks\":[]}},{\"config\":{\"useLogging\":false,\"timeout\":30000,\"faultTolerantRollbacks\":false},\"isRunning\":true,\"isComplete\":false,\"isTasksComplete\":false,\"isRollbacksComplete\":false,\"rollbacks\":[],\"current\":{\"taskLabel\":\"task 1 of 1 \\\"task-1\\\"\",\"task\":{\"number\":1,\"name\":\"task-1\"}},\"errors\":{\"tasks\":[],\"rollbacks\":[]}},{\"config\":{\"useLogging\":false,\"timeout\":30000,\"faultTolerantRollbacks\":false},\"isRunning\":false,\"isComplete\":true,\"isTasksComplete\":false,\"isRollbacksComplete\":false,\"rollbacks\":[],\"current\":{\"taskLabel\":\"task 1 of 1 \\\"task-1\\\"\",\"task\":{\"number\":1,\"name\":\"task-1\"}},\"errors\":{\"tasks\":[],\"rollbacks\":[]},\"collection\":\"\",\"taskIndex\":0,\"taskName\":\"\",\"taskLabel\":\"\"}]"
  );
});
