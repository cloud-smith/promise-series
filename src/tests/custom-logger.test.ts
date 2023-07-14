import { promiseSeries } from '../promiseSeries';
import { dummyTask } from './dummyTask';

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
