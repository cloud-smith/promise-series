import {
  SeriesProps,
  SeriesConfig,
  SeriesState,
  SeriesEvents,
  SeriesNamedTasks,
  SeriesFunctionPromise,
  SeriesFunction,
} from './promiseSeries.types';

export const promiseSeries = (props: SeriesProps) => {
  const config: SeriesConfig = {
    useLogging: true,
    useLogger: null,
  };

  let state: SeriesState = {
    error: '',
    isRunning: false,
    isComplete: false,
    tasks: {},
    results: {},
    taskCount: 0,
    taskIndex: 0,
    taskName: '',
  };

  const events: SeriesEvents = {
    onStateChange: undefined,
    onComplete: undefined,
    onError: undefined,
  };

  const parsers = {
    parseConfig: () => {
      config.useLogging = typeof props.config?.useLogging === 'boolean' ? props.config.useLogging : config.useLogging;
      config.useLogger = typeof props.config?.useLogger === 'function' ? props.config.useLogger : config.useLogger;
    },
    parseTasks: () => {
      const tasks: any = props.tasks;

      const results: {
        tasks: SeriesNamedTasks;
        keys: string[];
      } = {
        tasks: {},
        keys: [],
      };

      const isArraySeries = Array.isArray(tasks);

      const isNamedArraySeries =
        !isArraySeries && typeof tasks === 'object' && Object.keys(tasks).length
          ? true
          : false;

      const addTask = (name: string, task: SeriesFunctionPromise) =>
        (results.tasks[name] = task);

      const wrapFunctionWithPromsie = (task: SeriesFunction) => (state: any) =>
        new Promise((resolve, reject) => {
          try {
            const result = task(state);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });

      const parseArraySeries = () => {
        tasks.forEach((task: any, taskNumber: number) => {
          if (typeof task === 'object') {
            addTask(`task-${taskNumber + 1}`, task);
          }
          if (typeof task === 'function') {
            addTask(`task-${taskNumber + 1}`, wrapFunctionWithPromsie(task));
          }
        });
        results.keys = Object.keys(tasks);
      };

      const parseNamedArraySeries = () => {
        results.keys = Object.keys(tasks);
        (results.keys || []).forEach(key => {
          if (typeof tasks[key] === 'object') addTask(key, tasks[key]);
          if (typeof tasks[key] === 'function')
            addTask(key, wrapFunctionWithPromsie(tasks[key]));
        });
      };

      if (isArraySeries) parseArraySeries();
      if (isNamedArraySeries) parseNamedArraySeries();

      state.tasks = results.tasks;
      state.taskCount = results.keys.length;
      console.log('TEST', results);
    },
    parseEventHandlers: () => {
      events.onStateChange =
        typeof props.onStateChange === 'function'
          ? props.onStateChange
          : events.onStateChange;
      events.onComplete =
        typeof props.onComplete === 'function'
          ? props.onComplete
          : events.onComplete;
      events.onError =
        typeof props.onError === 'function' ? props.onError : events.onError;
    },
  };

  const setState = (stateUpdate: SeriesState) => {
    state = {
      ...state,
      ...stateUpdate,
    };
    if (events.onStateChange) events.onStateChange(state);
  };

  const logger = (data: any) => {
    if (!config.useLogging) return;
    if (config.useLogger) {
      config.useLogger(data);
    } else {
      // eslint-disable-next-line no-console
      console.log(data);
    }
  };

  const initPromsieSeries = () => {
    parsers.parseConfig();
    parsers.parseTasks();
    parsers.parseEventHandlers();
    return runPromsieSeries();
  };

  const runPromsieSeries = () =>
    new Promise((resolve, reject) =>
      (async () => {
        const onLoading = () =>
          setState({
            ...state,
            isRunning: true,
            isComplete: false,
            taskIndex: 0,
            taskName: '',
          });

        const onComplete = (results: any) => {
          logger('finished');
          resolve(results);
        };

        const onError = (error: string) => {
          logger('failed');
          reject(error);
        };

        onLoading();

        await promsieSeriesRunner().then(onComplete).catch(onError);
      })()
    );

  const promsieSeriesRunner = () =>
    new Promise((resolve, reject) =>
      (async () => {
        const keys = Object.keys(state.tasks);

        let taskIndex = 0;
        let taskName = '';
        let messageLabel = '';

        logger(`starting...`);

        for (taskIndex; taskIndex < keys.length; taskIndex++) {
          taskName = keys[taskIndex];

          messageLabel = `task ${taskIndex + 1} of ${
            state.taskCount
          }: ${taskName}`;

          if (state.error) return;

          logger(`${messageLabel}, starting`);

          setState({
            ...state,
            taskName,
            taskIndex,
          });

          await state.tasks[taskName](state)
            // eslint-disable-next-line no-loop-func
            .then(results => {
              logger(`${messageLabel}, finished`);
              setState({
                ...state,
                results: {
                  ...state.results,
                  [taskName]: results,
                },
              });
            })
            // eslint-disable-next-line no-loop-func
            .catch(error => {
              logger(`${messageLabel}, failed`);

              setState({
                ...state,
                isRunning: false,
                isComplete: true,
                error,
              });

              reject(error);
            });

          if (taskIndex + 1 === state.taskCount) {
            setState({
              ...state,
              taskName: '',
              isRunning: false,
              isComplete: true,
            });
            resolve(state.results);
          }
        }
      })()
    );

  return initPromsieSeries();
};
