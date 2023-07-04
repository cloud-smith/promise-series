import { PromiseSeriesTask, PromiseSeriesSettings } from './promiseSeries.types';

export const promiseSeries = (tasks: PromiseSeriesTask[], settings?: PromiseSeriesSettings) => new Promise((resolve, reject) => {
  let results: any = [];
  let errors: any[] = [];
  let taskNumber = 0;

  const config: PromiseSeriesSettings = {
    logging: false,
    logger: undefined,
    ...settings,
  };

  const defaultLogger = (data: any) => {
    if (!config.logging) return;
    console.log(data);
  };

  const logger = config.logger || defaultLogger;

  const onTaskSuccess = (data: any) => {
    logger(`promiseSeries ${taskNumber} of ${tasks.length} - success`);
    results.push(data);
  };

  const onTaskError = (error: any) => {
    logger(`promiseSeries ${taskNumber} of ${tasks.length} - failed`);
    errors.push(error);
    reject(error);
  };

  const onTasksSuccess = () => {
    logger(`promiseSeries - done`);
    resolve(results);
  };

  const execPromiseSeries = async () => {
    for(taskNumber=1; taskNumber <= tasks.length; taskNumber++) {
      if (!errors.length) {
        logger(`promiseSeries ${taskNumber} of ${tasks.length}`);

        await tasks[taskNumber-1]()
          .then(onTaskSuccess)
          .catch(onTaskError);
      }
    }  
  };
  
  execPromiseSeries()
    .then(onTasksSuccess);
});
