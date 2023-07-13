import { promiseSeries } from './promiseSeries';

const dummyTask = ({ delay, shouldFail, state }: {
  delay: number;
  shouldFail?: Boolean;
  state?: any;
}) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (state) console.log(state);
    if (shouldFail) reject(`Task Failed`);
    else resolve(`Task Success`);
  }, delay);
});

it('should run array series', async () => {
  const results = await promiseSeries({
		tasks: [
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
			() => dummyTask({ delay: 100 }),
		],
	});
	expect(results).toStrictEqual({
    "task-1": "Task Success",
    "task-2": "Task Success",
    "task-3": "Task Success",
  });
});

it('should fail array series', async () => {
  expect.assertions(1);
  try {
    await promiseSeries({
      tasks: [
        () => dummyTask({ delay: 100 }),
        () => dummyTask({ delay: 100, shouldFail: true }),
        () => dummyTask({ delay: 100 }),
      ],
    });
  } catch (error) {
    expect(error).toStrictEqual("Task Failed");
  }
});

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

it('should fail array series', async () => {
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

it('should run mixed task types', async () => {
  const results = await promiseSeries({
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
	expect(results).toStrictEqual({
    "task-1": "Task Success",
    "task-2": "Task Success",
    "task-3": "Task Success",
    "task-4": "non-async task success"
  });
});

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

it('should use a custom logger', async () => {
  const logs = [];

  const customLogger = (log: string) => {
    logs.push(log);
    console.log(log);
  };

  await promiseSeries({
    config: {
      useLogging: true,
      useLogger: customLogger,
    },
		tasks: [
			() => dummyTask({ delay: 100 }),
		],
	});

	expect(logs).toStrictEqual(["starting...", "task 1 of 1: task-1, starting", "task 1 of 1: task-1, finished", "finished"]);
});
