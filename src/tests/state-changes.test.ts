import { promiseSeries } from '../promiseSeries';
import { dummyTask } from '../dummyTask';

it('should return state changes', async () => {
  const states = [];
  let statesWithoutTasks = [];

  await promiseSeries({
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
    `[{\"isRunning\":true,\"isComplete\":false,\"taskIndex\":0,\"taskName\":\"\",\"taskLabel\":\"\"},{\"isRunning\":true,\"isComplete\":false,\"taskIndex\":0,\"taskName\":\"task-1\",\"taskLabel\":\"task 1 of 1 \\\"task-1\\\"\"},{\"isRunning\":false,\"isComplete\":true,\"taskIndex\":0,\"taskName\":\"\",\"taskLabel\":\"\"}]`    
  );
});
