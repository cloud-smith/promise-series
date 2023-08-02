"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseSeries = void 0;
const promise_until_1 = require("@cloud-smith/promise-until");
class PromiseSeries {
    constructor(props) {
        this.props = {};
        this.hooks = {};
        this.defaults = {
            config: {
                useLogging: true,
                timeout: 30000,
            },
            state: {
                config: {},
                isRunning: false,
                isComplete: false,
                isTasksSuccessful: false,
                isRollbacksSuccessful: false,
                tasks: [],
                rollbacks: [],
                current: {},
                errors: {
                    tasks: [],
                    rollbacks: [],
                },
            },
        };
        this.state = {
            data: this.defaults.state,
            get: () => this.state.data,
            set: update => {
                this.state.data = Object.assign(Object.assign({}, this.state.data), update);
                this.events.onStateChange();
            },
            push: (task, collection) => this.state.data[collection].push(task),
        };
        this.timers = {
            timeouts: {},
            intervals: {},
            createTimeout: (timerName, timeoutValue, callback) => this.timers.timeouts[timerName] = setTimeout(callback, timeoutValue),
            clearTimeout: timerName => {
                clearTimeout(this.timers.timeouts[timerName]);
                delete (this.timers.timeouts[timerName]);
            },
            createInterval: (intervalName, intervalValue, callback) => this.timers.intervals[intervalName] = setTimeout(callback, intervalValue),
            clearInterval: intervalName => {
                clearInterval(this.timers.intervals[intervalName]);
                delete (this.timers.intervals[intervalName]);
            },
        };
        this.events = {
            onStateChange: () => {
                if (this.hooks.onStateChange) {
                    this.hooks.onStateChange(this.utils.createStateReport());
                }
            },
            onStart: state => {
                this.log('starting series tasks');
                if (!state.tasks.length) {
                    this.log('tasks empty');
                    this.events.onFinish(state);
                }
                else {
                    this.state.set({
                        isComplete: false,
                        isRunning: true,
                    });
                    if (this.hooks.onStart)
                        this.hooks.onStart(this.utils.createStateReport());
                }
            },
            onTaskStart: state => {
                this.log(`${state.current.taskLabel} starting`);
                if (this.hooks.onTaskStart)
                    this.hooks.onTaskStart(this.utils.createStateReport());
            },
            onTaskComplete: task => {
                const { taskLabel } = this.state.get().current;
                if (!taskLabel)
                    return; // TODO - handle destoring tasks
                this.log(`${taskLabel} complete`);
                this.state.data.tasks[task.number - 1] = task;
                if (this.hooks.onTaskComplete)
                    this.hooks.onTaskComplete(this.utils.createStateReport());
            },
            onTaskError: task => {
                const { taskLabel } = this.state.get().current;
                const error = new Error(task.error);
                this.log(`${taskLabel} failed`);
                this.log(error.message);
                this.state.data.tasks[task.number - 1] = task;
                this.state.data.errors.tasks.push(task);
                if (this.hooks.onTaskError)
                    this.hooks.onTaskError(this.utils.createStateReport());
            },
            onRollbackStart: state => {
                this.log(`${state.current.taskLabel} starting`);
                if (this.hooks.onRollbackStart)
                    this.hooks.onRollbackStart(this.utils.createStateReport());
            },
            onRollbackComplete: task => {
                const { taskLabel } = this.state.get().current;
                if (!taskLabel)
                    return;
                this.log(`${taskLabel} complete`);
                this.state.data.rollbacks[task.number - 1] = task;
                if (this.hooks.onRollbackComplete)
                    this.hooks.onRollbackComplete(this.utils.createStateReport());
            },
            onRollbackError: task => {
                const { taskLabel } = this.state.get().current;
                const error = new Error(task.error);
                this.log(`${taskLabel} failed`);
                this.log(error.message);
                this.state.data.rollbacks[task.number - 1] = task;
                this.state.data.errors.rollbacks.push(task);
                if (this.hooks.onRollbackError)
                    this.hooks.onRollbackError(this.utils.createStateReport());
            },
            onFinish: () => {
                const { get: getState, set: setState } = this.state;
                const state = getState();
                const hasTasks = state.tasks.length ? true : false;
                const hasRollbacks = state.rollbacks.length ? true : false;
                const hasTaskErrors = state.errors.tasks.length ? true : false;
                const hasRollbackErrors = state.errors.rollbacks.length ? true : false;
                const forceRollbacks = state.config.forceRollbacks;
                const isTasksSuccessful = hasTasks && !hasTaskErrors ? true : false;
                const isRollbacksSuccessful = (!isTasksSuccessful || forceRollbacks) && hasRollbacks && !hasRollbackErrors ? true : false;
                this.log(`finished series`);
                setState({
                    isTasksSuccessful,
                    isRollbacksSuccessful,
                });
                if (this.hooks.onFinish) {
                    this.hooks.onFinish(Object.assign({}, this.utils.createReport()));
                }
            },
        };
        this.parsers = {
            parseConfig: props => {
                if (typeof props !== 'object')
                    return;
                this.props = Object.assign(Object.assign(Object.assign({}, this.props), this.defaults), props);
                // configuration
                this.state.data.config.useLogging = typeof props.useLogging === 'boolean' ? props.useLogging : Boolean(this.defaults.config.useLogging);
                this.state.data.config.timeout = typeof props.timeout === 'number' ? props.timeout : Number(this.defaults.config.timeout);
                this.state.data.config.forceParallelRollbacks = typeof props.forceParallelRollbacks === 'boolean' ? props.forceParallelRollbacks : Boolean(this.defaults.config.forceParallelRollbacks);
                this.state.data.config.forceRollbacks = typeof props.forceRollbacks === 'boolean' ? props.forceRollbacks : Boolean(this.defaults.config.forceRollbacks);
                // hooks
                if (typeof props.useLogger === 'function')
                    this.props.useLogger = props.useLogger;
                if (typeof props.onStateChange === 'function')
                    this.hooks.onStateChange = props.onStateChange;
                if (typeof props.onStart === 'function')
                    this.hooks.onStart = props.onStart;
                if (typeof props.onTaskStart === 'function')
                    this.hooks.onTaskStart = props.onTaskStart;
                if (typeof props.onTaskComplete === 'function')
                    this.hooks.onTaskComplete = props.onTaskComplete;
                if (typeof props.onTaskError === 'function')
                    this.hooks.onTaskError = props.onTaskError;
                if (typeof props.onRollbackStart === 'function')
                    this.hooks.onRollbackStart = props.onRollbackStart;
                if (typeof props.onRollbackComplete === 'function')
                    this.hooks.onRollbackComplete = props.onRollbackComplete;
                if (typeof props.onRollbackError === 'function')
                    this.hooks.onRollbackError = props.onRollbackError;
                if (typeof props.onFinish === 'function')
                    this.hooks.onFinish = props.onFinish;
            },
            parseTasks: () => {
                const { getCollectionType, createTaskWrapper, createTaskPromise } = this.utils;
                const format = getCollectionType(this.props.tasks);
                if (format.isArray) {
                    this.props.tasks.forEach(task => {
                        if (typeof task === 'object')
                            this.state.push(createTaskWrapper('tasks', task), 'tasks');
                        if (typeof task === 'function')
                            this.state.push(createTaskWrapper('tasks', createTaskPromise(task)), 'tasks');
                    });
                }
                if (format.isNamedArray) {
                    Object.keys(this.props.tasks).forEach(taskName => {
                        const task = this.props.tasks[taskName];
                        if (typeof task === 'object')
                            this.state.push(createTaskWrapper('tasks', task, taskName), 'tasks');
                        if (typeof task === 'function')
                            this.state.push(createTaskWrapper('tasks', createTaskPromise(task), taskName), 'tasks');
                    });
                }
            },
            parseRollbacks: () => {
                const { getCollectionType, createTaskWrapper, createTaskPromise } = this.utils;
                const format = getCollectionType(this.props.rollbacks);
                if (format.isArray) {
                    this.props.rollbacks.forEach(rollback => {
                        if (typeof rollback === 'object')
                            this.state.push(createTaskWrapper('rollbacks', rollback), 'rollbacks');
                        if (typeof rollback === 'function')
                            this.state.push(createTaskWrapper('rollbacks', createTaskPromise(rollback)), 'rollbacks');
                    });
                }
                if (format.isNamedArray) {
                    Object.keys(this.props.rollbacks).forEach(rollbackName => {
                        const rollback = this.props.rollbacks[rollbackName];
                        if (typeof rollback === 'object')
                            this.state.push(createTaskWrapper('rollbacks', rollback, rollbackName), 'rollbacks');
                        if (typeof rollback === 'function')
                            this.state.push(createTaskWrapper('rollbacks', createTaskPromise(rollback), rollbackName), 'rollbacks');
                    });
                }
                if ((this.state.data.tasks.length && this.state.data.rollbacks.length) &&
                    this.state.data.tasks.length !== this.state.data.rollbacks.length) {
                    this.log('Warning, task and rollback sizes should match');
                }
            },
        };
        this.utils = {
            findTask: key => {
                let wrapper = undefined;
                if (typeof key === 'number')
                    wrapper = this.state.get().tasks.find(task => task.number === key) || undefined;
                if (typeof key === 'string')
                    wrapper = this.state.get().tasks.find(task => task.name === key) || undefined;
                return wrapper;
            },
            findRollback: key => {
                let wrapper = undefined;
                if (typeof key === 'number')
                    wrapper = this.state.get().rollbacks.find(task => task.number === key) || undefined;
                if (typeof key === 'string')
                    wrapper = this.state.get().rollbacks.find(task => task.name === key) || undefined;
                return wrapper;
            },
            getCollectionType: collection => {
                const isArray = Array.isArray(collection);
                const isNamedArray = !isArray && typeof collection === 'object' && Object.keys(collection).length
                    ? true
                    : false;
                return {
                    isArray,
                    isNamedArray,
                };
            },
            createTaskPromise: task => state => (0, promise_until_1.promiseUntil)(resolve => {
                const result = task(state);
                resolve(result);
            }),
            createTaskWrapper: (collectionName, action, actionName) => {
                const number = this.state.get()[collectionName].length + 1;
                const type = collectionName === 'tasks' ? 'task' : collectionName === 'rollbacks' ? 'rollback' : 'task';
                const name = actionName ? actionName : `${type}-${number}`;
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
            createTaskLabel: (collectionName, taskIndex, taskName) => {
                const collectionSize = this.state.get()[collectionName].length;
                const taskType = collectionName === 'tasks' ? 'task' : collectionName === 'rollbacks' ? 'rollback' : '';
                return `${taskType} ${taskIndex + 1} of ${collectionSize} "${taskName}"`;
            },
            createRollbackLabel: (taskIndex, taskName) => {
                const collectionSize = this.state.get().rollbacks.length;
                return `rollback ${taskIndex + 1} of ${collectionSize} "${taskName}"`;
            },
            createReport: () => {
                const state = this.state.get();
                const utils = this.utils;
                return {
                    isTasksSuccessful: state.isTasksSuccessful,
                    isRollbacksSuccessful: state.isRollbacksSuccessful,
                    errors: state.errors,
                    tasks: state.tasks,
                    rollbacks: state.rollbacks,
                    findTask: utils.findTask,
                    findRollback: utils.findRollback,
                };
            },
            createStateReport: () => {
                const { config, current } = this.state.get();
                const report = this.utils.createReport();
                return Object.assign(Object.assign({}, report), { config,
                    current });
            },
        };
        this.log = (data) => {
            if (!this.state.get().config.useLogging)
                return;
            console.log(data);
        };
        this.run = () => new Promise((resolve, reject) => (() => __awaiter(this, void 0, void 0, function* () {
            const { get: getState, set: setState } = this.state;
            const { config, tasks } = getState();
            const timeout = config.timeout || 0;
            const shouldRollback = getState().rollbacks.length ? true : false;
            let state = getState();
            let taskIndex = 0;
            let taskLabel = '';
            let taskName = '';
            let wrapper = null;
            const onTaskSuccess = (results) => {
                removeTimeout();
                if (wrapper)
                    this.events.onTaskComplete(Object.assign(Object.assign({}, wrapper), { results }));
            };
            const onTaskError = (error) => __awaiter(this, void 0, void 0, function* () {
                removeTimeout();
                if (wrapper)
                    this.events.onTaskError(Object.assign(Object.assign({}, wrapper), { error }));
                if (shouldRollback) {
                    yield this.rollback()
                        .then(resolve)
                        .catch(reject);
                }
                else {
                    this.events.onFinish(getState());
                    reject(this.utils.createReport());
                }
            });
            const createTimeout = () => {
                if (timeout)
                    this.timers.createTimeout(`task-${taskName}`, timeout, () => {
                        onTaskError('Task timed out');
                    });
            };
            const removeTimeout = () => {
                if (timeout)
                    this.timers.clearTimeout(`task-${taskName}`);
            };
            this.events.onStart(state);
            for (taskIndex; taskIndex < tasks.length; taskIndex++) {
                state = getState();
                if (!state.isRunning || state.errors.tasks.length)
                    return;
                wrapper = tasks[taskIndex];
                taskName = wrapper.name;
                taskLabel = this.utils.createTaskLabel('tasks', taskIndex, taskName);
                state = Object.assign(Object.assign({}, state), { current: Object.assign(Object.assign({}, state.current), { taskLabel, task: wrapper }) });
                setState(state);
                this.events.onTaskStart(state);
                createTimeout();
                yield wrapper.action(this.utils.createStateReport())
                    .until(timeout)
                    .then(onTaskSuccess)
                    .catch(onTaskError);
            }
            if (config.forceRollbacks && shouldRollback) {
                yield this.rollback()
                    .then(resolve)
                    .catch(reject);
            }
            else {
                this.events.onFinish(getState());
                resolve(this.utils.createReport());
            }
        }))());
        this.rollback = () => new Promise((resolve, reject) => (() => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { get: getState, set: setState } = this.state;
            const { config, rollbacks, current } = getState();
            const timeout = config.timeout || 0;
            let state = getState();
            let taskIndex = Number((_a = current.task) === null || _a === void 0 ? void 0 : _a.number) - 1;
            let taskLabel = '';
            let taskName = '';
            let wrapper = null;
            const onTaskSuccess = (results) => {
                removeTimeout();
                if (wrapper)
                    this.events.onRollbackComplete(Object.assign(Object.assign({}, wrapper), { results }));
            };
            const onTaskError = (error) => {
                removeTimeout();
                if (wrapper)
                    this.events.onRollbackError(Object.assign(Object.assign({}, wrapper), { error }));
            };
            const createTimeout = () => {
                if (timeout)
                    this.timers.createTimeout(`rollback-${taskName}`, timeout, () => {
                        throw new Error('Rollback timed out');
                    });
            };
            const removeTimeout = () => {
                if (timeout)
                    this.timers.clearTimeout(`rollback-${taskName}`);
            };
            for (taskIndex; taskIndex >= 0; taskIndex--) {
                state = getState();
                if (!state.isRunning || (state.errors.rollbacks.length && !config.forceParallelRollbacks))
                    return;
                wrapper = rollbacks[taskIndex];
                taskName = wrapper.name;
                taskLabel = this.utils.createTaskLabel('rollbacks', taskIndex, taskName);
                state = Object.assign(Object.assign({}, state), { current: Object.assign(Object.assign({}, state.current), { taskLabel, task: wrapper }) });
                setState(state);
                this.events.onRollbackStart(state);
                createTimeout();
                yield wrapper.action(this.utils.createStateReport())
                    .until(timeout)
                    .then(onTaskSuccess)
                    .catch(onTaskError);
            }
            state = getState();
            this.events.onFinish(state);
            if (config.forceRollbacks) {
                resolve(this.utils.createReport());
            }
            else {
                reject(this.utils.createReport());
            }
        }))());
        this.promise = () => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.run();
            }
            catch (error) {
                throw error;
            }
        });
        this.parsers.parseConfig(props);
        this.parsers.parseTasks();
        this.parsers.parseRollbacks();
    }
}
exports.PromiseSeries = PromiseSeries;
;
