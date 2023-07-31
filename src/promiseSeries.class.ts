import * as Types from './promiseSeries.types';

export class PromiseSeries {

  props: Types.SeriesProps = {}
  hooks: Types.SeriesHooks = {}

  defaults: Types.SeriesConfig = {
    useLogging: true,
    timeout: 30000,
  }

  constructor (props: Types.SeriesProps) {
    this.parsers.parseConfig(props);
    this.parsers.parseTasks();
    this.parsers.parseRollbacks();
  }

  state: Types.SeriesState = {
    data: {
      config: {},
      isRunning: false,
      isComplete: false,
      isTasksComplete: false,
      isRollbacksComplete: false,
      tasks: [],
      rollbacks: [],
      current: {},
      errors: {
        tasks: null,
        rollbacks: null,
      },
    },
    get: () => this.state.data,
    set: update => {
      this.state.data = {
        ...this.state.data,
        ...update,
      };
      this.events.onStateChange(this.state.get());
    },
    push: (task, collection) => this.state.data[collection].push(task),
  }

  timers: Types.SeriesTimers = {
    timeouts: {},
    intervals: {},
    createTimeout: (timerName, timeoutValue, callback) =>
      this.timers.timeouts[timerName] = setTimeout(callback, timeoutValue),
    clearTimeout: timerName => {
      clearTimeout(this.timers.timeouts[timerName]);
      delete(this.timers.timeouts[timerName]);
    },
    createInterval: (intervalName, intervalValue, callback) =>
      this.timers.intervals[intervalName] = setTimeout(callback, intervalValue),
    clearInterval: intervalName => {
      clearInterval(this.timers.intervals[intervalName]);
      delete(this.timers.intervals[intervalName]);
    },
  }

  events: Types.SeriesEvents = {
    onStateChange: () => {
      if (this.hooks.onStateChange) this.hooks.onStateChange(this.utils.getHookProps());
    },
    onStart: state => {
      this.log('starting series tasks');
      if (!state.tasks.length) {
        this.log('tasks empty');
        this.events.onFinish(state);
      } else {
        this.state.set({
          isComplete: false,
          isRunning: true,
        });
        if (this.hooks.onStart) this.hooks.onStart(this.utils.getHookProps());
      }
    },
    onTaskStart: state => {
      this.log(`${state.current.taskLabel} starting`);
      if (this.hooks.onTaskStart) this.hooks.onTaskStart(this.utils.getHookProps());
    },
    onTaskComplete: task => {
      const { taskLabel } = this.state.get().current;
      if (! taskLabel) return; // TODO - handle destoring tasks
      this.log(`${taskLabel} complete`);
      this.state.data.tasks[task.number-1] = task;
      if (this.hooks.onTaskComplete) this.hooks.onTaskComplete(task);
    },
    onTaskError: task => {
      const { taskLabel } = this.state.get().current;
      this.log(`${taskLabel} failed`);
      this.log(task.error);
      this.state.data.tasks[task.number-1] = task;
      this.state.set({ isRunning: false });
      if (this.hooks.onTaskError) this.hooks.onTaskError(task);
    },
    onRollbackStart: state => {
      this.log(`${state.current.taskLabel} starting`);
      if (this.hooks.onRollbackStart) this.hooks.onRollbackStart(this.utils.getHookProps());
    },
    onRollbackComplete: task => {
      const { taskLabel } = this.state.get().current;
      if (! taskLabel) return; // TODO - handle destoring tasks
      this.log(`${taskLabel} complete`);
      this.state.data.rollbacks[task.number-1] = task;
      if (this.hooks.onRollbackComplete) this.hooks.onRollbackComplete(this.utils.getHookProps());
    },
    onRollbackError: task => {
      const { taskLabel } = this.state.get().current;
      this.log(`${taskLabel} failed`);
      this.log(task.error);
      this.state.data.rollbacks[task.number-1] = task;
      this.state.set({ isRunning: false });
      if (this.hooks.onRollbackError) this.hooks.onRollbackError(task);
    },
    onFinish: () => {
      this.log(`finished series tasks`);
      this.state.set({
        collection: '',
        isComplete: true,
        isRunning: false,
        taskIndex: 0,
        taskName: '',
        taskLabel: '',
      });
      if (this.hooks.onFinish) this.hooks.onFinish(this.utils.getHookProps());
    },
  }

  parsers: Types.SeriesParsers = {
    parseConfig: props => {
      if (typeof props !== 'object') return;
      this.props = { ...this.props, ...this.defaults, ...props };
      if (typeof props.useLogging === 'boolean') this.state.data.config.useLogging = props.useLogging;
      if (typeof props.timeout === 'number') this.state.data.config.timeout = props.timeout;
      if (typeof props.faultTolerantRollbacks === 'boolean') this.state.data.config.faultTolerantRollbacks = props.faultTolerantRollbacks;
      if (typeof props.useLogger === 'function') this.props.useLogger = props.useLogger;
      if (typeof props.onStateChange === 'function') this.hooks.onStateChange = props.onStateChange;
      if (typeof props.onStart === 'function') this.hooks.onStart = props.onStart;
      if (typeof props.onTaskStart === 'function') this.hooks.onTaskStart = props.onTaskStart;
      if (typeof props.onTaskComplete === 'function') this.hooks.onTaskComplete = props.onTaskComplete;
      if (typeof props.onTaskError === 'function') this.hooks.onTaskError = props.onTaskError;
      if (typeof props.onRollbackStart === 'function') this.hooks.onRollbackStart = props.onRollbackStart;
      if (typeof props.onRollbackComplete === 'function') this.hooks.onRollbackComplete = props.onRollbackComplete;
      if (typeof props.onRollbackError === 'function') this.hooks.onRollbackError = props.onRollbackError;
      if (typeof props.onFinish === 'function') this.hooks.onFinish = props.onFinish;
    },
    parseTasks: () => {
      const { getCollectionType, createTaskWrapper, createTaskPromise } = this.utils;
      const format = getCollectionType(this.props.tasks);

      if (format.isArray) {
        (this.props.tasks as Types.SeriesSupportedTasksArray).forEach(task => {
          if (typeof task === 'object') this.state.push(createTaskWrapper(task), 'tasks');
          if (typeof task === 'function') this.state.push(createTaskWrapper(createTaskPromise(task)), 'tasks');
        });
      }

      if (format.isNamedArray) {
        Object.keys(this.props.tasks as Types.SeriesSupportedTasksObject).forEach(taskName => {
          const task = (this.props.tasks as Types.SeriesSupportedTasksObject)[taskName];
          if (typeof task === 'object') this.state.push(createTaskWrapper(task), 'tasks');
          if (typeof task === 'function') this.state.push(createTaskWrapper(createTaskPromise(task)), 'tasks');
        });
      }
    },
    parseRollbacks: () => {
      const { getCollectionType, createTaskWrapper, createTaskPromise } = this.utils;
      const format = getCollectionType(this.props.rollbacks);

      if (format.isArray) {
        (this.props.rollbacks as Types.SeriesSupportedTasksArray).forEach(task => {
          if (typeof task === 'object') this.state.push(createTaskWrapper(task), 'rollbacks');
          if (typeof task === 'function') this.state.push(createTaskWrapper(createTaskPromise(task)), 'rollbacks');
        });
      }

      if (format.isNamedArray) {
        Object.keys(this.props.rollbacks as Types.SeriesSupportedTasksObject).forEach(taskName => {
          const task = (this.props.rollbacks as Types.SeriesSupportedTasksObject)[taskName];
          if (typeof task === 'object') this.state.push(createTaskWrapper(task), 'rollbacks');
          if (typeof task === 'function') this.state.push(createTaskWrapper(createTaskPromise(task)), 'rollbacks');
        });
      }
    },
  }

  utils: Types.SeriesUtils = {
    findTask: key => {
      let wrapper = {};
      if (typeof key === 'number') wrapper = this.state.get().tasks.find(task => task.number === key) || {};
      if (typeof key === 'string') wrapper = this.state.get().tasks.find(task => task.name === key) || {};
      return wrapper;
    },
    findRollback: key => {
      let wrapper = {};
      if (typeof key === 'number') wrapper = this.state.get().rollbacks.find(task => task.number === key) || {};
      if (typeof key === 'string') wrapper = this.state.get().rollbacks.find(task => task.name === key) || {};
      return wrapper;
    },
    getCollectionType: collection => {
      const isArray = Array.isArray(collection);

      const isNamedArray =
        !isArray && typeof collection === 'object' && Object.keys(collection).length
          ? true
          : false;
      
      return {
        isArray,
        isNamedArray,
      }
    },
    createTaskPromise: task =>
      state =>
        new Promise((resolve, reject) => {
          try {
            const result = task(state);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }),
    createTaskWrapper: (action, actionName) => {
      const number = this.state.get().tasks.length + 1;
      const name = actionName ? actionName : `task-${number}`;
      return {
        number,
        name,
        action,
        results: undefined,
        error: undefined,
      };
    },
    createRollbackWrapper: (action, actionName) => {
      const number = this.state.get().rollbacks.length + 1;
      const name = actionName ? actionName : `rollback-${number}`;
      return {
        number,
        name,
        action,
        results: undefined,
        error: undefined,
      };
    },
    createTaskLabel: (taskIndex, taskName) => {
      const collectionSize = this.state.get().tasks.length;
      return `task ${taskIndex+1} of ${collectionSize} "${taskName}"`;
    },
    createRollbackLabel: (taskIndex, taskName) => {
      const collectionSize = this.state.get().rollbacks.length;
      return `rollback ${taskIndex+1} of ${collectionSize} "${taskName}"`;
    },
    getHookProps: () => ({
      ...this.state.get(),
      findTask: this.utils.findTask,
      findRollback: this.utils.findRollback,
    }),
  }

  log = (data: any) => {
    if (!this.state.get().config.useLogging) return
    console.log(data);
  }

  run = () => new Promise<Types.SeriesTaskWrapper[]>((resolve, reject) => (async () => {
    const { get: getState, set: setState } = this.state;
    const { config, tasks } = getState();
    const timeout = config.timeout || 0;
    
    let state = getState();
    
    let taskIndex = 0;
    let taskLabel = '';
    let taskName = '';
    let wrapper: Types.SeriesTaskWrapper | null = null;

    const onTaskSuccess = (results: any) => {
      if (wrapper)
        this.events.onTaskComplete({
          ...wrapper,
          results,
        });
    };

    const onTaskError = (error: any) => {
      const shouldRollback = state.rollbacks.length ? true : false;
      
      removeTimeout();
      
      if (wrapper)
        this.events.onTaskError({
          ...wrapper,
          error,
        });

      if (shouldRollback) {
        onRollback();
      }
      else {
        this.events.onFinish(this.utils.getHookProps());
        reject({ ...wrapper, error });
      }
    };

    const onRollback = async () =>
      await this.rollback()
        .then(resolve)
        .catch(reject);

    const createTimeout = () => {
      if (timeout)
        this.timers.createTimeout(taskName, timeout, () => {
          onTaskError('Task timed out');
        });
    };

    const removeTimeout = () => {
      if (timeout) this.timers.clearTimeout(taskName);
    };

    this.events.onStart(state);

    for (taskIndex; taskIndex < tasks.length; taskIndex++) {
      state = getState();
      if (! state.isRunning || state.errors.tasks) return;

      wrapper = tasks[taskIndex];
      taskName = wrapper.name;
      taskLabel = this.utils.createTaskLabel(taskIndex, taskName);

      state = {
        ...state,
        current: {
          ...state.current,
          taskLabel,
          task: wrapper,
        },
      };
      
      setState(state);
      this.events.onTaskStart(state);

      createTimeout();

      await wrapper.action(this.utils.getHookProps())
        .then(onTaskSuccess)
        .catch(onTaskError)
        .finally(removeTimeout);
    }

    this.events.onFinish(this.utils.getHookProps());
    resolve(this.state.get().tasks);
  })())

  rollback = () => new Promise<Types.SeriesTaskWrapper[]>((resolve, reject) => (async () => {
    const { get: getState, set: setState } = this.state;
    const { config, rollbacks, current } = getState();
    const timeout = config.timeout || 0;

    let state = getState();

    let taskIndex = current.task?.number || 0 - 1;
    let taskLabel = '';
    let taskName = '';
    let wrapper: Types.SeriesTaskWrapper | null = null;

    const onTaskSuccess = (results: any) => {
      if (wrapper)
        this.events.onRollbackComplete({
          ...wrapper,
          results,
        });
    };

    const onTaskError = (error: any) => {
      removeTimeout();
      if (wrapper)
        this.events.onRollbackError({
          ...wrapper,
          error,
        });
      reject({ ...wrapper, error });
    };

    const createTimeout = () => {
      if (timeout)
        this.timers.createTimeout(taskName, timeout, () => {
          throw new Error('Rollback timed out') 
        });
    };

    const removeTimeout = () => {
      if (timeout) this.timers.clearTimeout(taskName);
    };

    for (taskIndex; taskIndex >= 0; taskIndex--) {
      state = getState();
      if (! state.isRunning || state.errors.rollbacks) return;

      wrapper = rollbacks[taskIndex];
      taskName = wrapper.name;
      taskLabel = this.utils.createTaskLabel(taskIndex, taskName);

      state = {
        ...state,
        current: {
          ...state.current,
          taskLabel,
          task: wrapper,
        },
      };

      setState(state);
      this.events.onRollbackStart(state);

      createTimeout();

      await wrapper.action(this.utils.getHookProps())
        .then(onTaskSuccess)
        .catch(onTaskError)
        .finally(removeTimeout);
    }

    this.events.onFinish(this.utils.getHookProps());

    reject(this.utils.getHookProps());
  })())

  promise: Types.SeriesPromise = async () => {
    try {
      return await this.run();
    } catch (error) {
      throw error;
    }
  }

};

export const promiseSeries = (props: Types.SeriesProps) =>
  new PromiseSeries(props)
    .promise();
