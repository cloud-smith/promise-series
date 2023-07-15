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

	expect(statesWithoutTasks).toStrictEqual(
    [
      {
        "error": "",
        "isComplete": false,
        "isRunning": true,
        "results": {},
        "taskCount": 1,
        "taskIndex": 0,
        "taskName": "",
      },
      {
        "error": "",
        "isComplete": false,
        "isRunning": true,
        "results": {},
        "taskCount": 1,
        "taskIndex": 0,
        "taskName": "task-1",
      },
      {
        "error": "",
        "isComplete": false,
        "isRunning": true,
        "results": {
          "task-1": "Task Success",
        },
        "taskCount": 1,
        "taskIndex": 0,
        "taskName": "task-1",
      },
      {
        "error": "",
        "isComplete": true,
        "isRunning": false,
        "results": {
          "task-1": "Task Success",
        },
        "taskCount": 1,
        "taskIndex": 0,
        "taskName": "",
      },
    ]    
  );
});
