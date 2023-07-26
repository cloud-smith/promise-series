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
exports.promiseSeries = void 0;
const promiseSeries = (props) => {
    const utils = {
        logger: (data) => {
            if (!config.useLogging)
                return;
            // eslint-disable-next-line no-console
            console.log(data);
        },
        getTaskType: (collection) => {
            const isArray = Array.isArray(collection);
            const isNamedArray = !isArray && typeof collection === 'object' && Object.keys(collection).length
                ? true
                : false;
            return {
                isArray,
                isNamedArray,
            };
        },
        wrapTask: (task) => (state) => new Promise((resolve, reject) => {
            try {
                const result = task(state);
                resolve(result);
            }
            catch (error) {
                reject(error);
            }
        }),
    };
    let config = {
        useLogging: true,
        timeout: 30000,
        shouldRollbackInSeries: false,
        useLogger: utils.logger,
        onStateChange: () => { },
        onStarting: () => { },
        onTaskStart: () => { },
        onTaskComplete: () => { },
        onTaskFailed: () => { },
        onFinished: () => { },
    };
    let state = {
        isRunning: false,
        isComplete: false,
        taskIndex: 0,
        taskName: '',
        taskLabel: '',
        get: () => ({
            isRunning: state.isRunning,
            isComplete: state.isComplete,
            taskIndex: state.taskIndex,
            taskName: state.taskName,
            taskLabel: state.taskLabel,
            tasks: tasks.stack,
            findTask: key => {
                let task = {};
                if (typeof key === 'number')
                    task = tasks.stack.find(item => item.number === key);
                if (typeof key === 'string')
                    task = tasks.stack.find(item => item.name === key);
                return task;
            },
            findResults: key => {
                let task = {};
                if (typeof key === 'number')
                    task = tasks.stack.find(item => item.number === key);
                if (typeof key === 'string')
                    task = tasks.stack.find(item => item.name === key);
                return task.results;
            },
        }),
        set: update => {
            state = Object.assign(Object.assign({}, state), update);
            config.onStateChange(state.get());
        },
    };
    let tasks = {
        stack: [],
        total: 0,
        push: (task, taskName) => {
            const number = tasks.stack.length + 1;
            const name = taskName ? taskName : `task-${number}`;
            tasks.stack.push({
                number,
                name,
                task,
                results: undefined,
                error: undefined,
            });
        },
        set: update => tasks = Object.assign(Object.assign({}, tasks), update),
    };
    let rollbacks = {
        stack: [],
        total: 0,
        push: (task, taskName) => {
            const number = rollbacks.stack.length + 1;
            const name = taskName ? taskName : `task-${number}`;
            rollbacks.stack.push({
                number,
                name,
                task,
                results: undefined,
                error: undefined,
            });
        },
        set: update => rollbacks = Object.assign(Object.assign({}, rollbacks), update),
    };
    const events = {
        onStarting: () => {
            log('starting tasks');
            config.onStarting(state.get());
            if (tasks.total) {
                state.set({
                    isComplete: false,
                    isRunning: true,
                });
            }
            else {
                log('tasks empty');
            }
        },
        onTaskStart: () => {
            log(`${state.taskLabel} starting`);
            config.onTaskStart(state.get());
        },
        onTaskComplete: (results) => {
            log(`${state.taskLabel} complete`);
            config.onTaskComplete(state.get());
            tasks.stack[state.taskIndex].results = results;
        },
        onTaskFailed: (error) => {
            log('task failed');
            config.onTaskFailed(state.get());
            tasks.stack[state.taskIndex].error = error;
            state.set({
                isRunning: false,
            });
        },
        onFinished: () => {
            log('finished tasks');
            config.onFinished(state.get());
            state.set({
                isComplete: true,
                isRunning: false,
                taskIndex: 0,
                taskName: '',
                taskLabel: '',
            });
        },
        onStartingRollback: () => {
            log('starting rollback');
            config.onStarting(state.get());
            if (rollbacks.total) {
                state.set({
                    isComplete: false,
                    isRunning: true,
                });
            }
        },
        onRollbackTaskStart: () => {
            log(`${state.taskLabel} starting`);
            config.onTaskStart(state.get());
        },
        onRollbackTaskComplete: (results) => {
            log(`${state.taskLabel} complete`);
            config.onTaskComplete(state.get());
            rollbacks.stack[state.taskIndex].results = results;
        },
        onRollbackTaskFailed: (error) => {
            log(`${state.taskLabel} failed`);
            config.onTaskFailed(state.get());
            rollbacks.stack[state.taskIndex].error = error;
            state.set({
                isRunning: false,
            });
        },
        onRollbackFinished: () => {
            log('finished rolling back');
            config.onFinished(state.get());
            state.set({
                isComplete: true,
                isRunning: false,
                taskIndex: 0,
                taskName: '',
                taskLabel: '',
            });
        },
    };
    const parsers = {
        parseConfig: (configUpdate) => {
            if (typeof configUpdate !== 'object')
                return;
            if (typeof configUpdate.useLogging === 'boolean')
                config.useLogging = configUpdate.useLogging;
            if (typeof configUpdate.timeout === 'number')
                config.timeout = configUpdate.timeout;
            if (typeof configUpdate.useLogger === 'function')
                config.useLogger = configUpdate.useLogger;
            if (typeof configUpdate.onStateChange === 'function')
                config.onStateChange = configUpdate.onStateChange;
            if (typeof configUpdate.onStarting === 'function')
                config.onStarting = configUpdate.onStarting;
            if (typeof configUpdate.onTaskStart === 'function')
                config.onTaskStart = configUpdate.onTaskStart;
            if (typeof configUpdate.onTaskComplete === 'function')
                config.onTaskComplete = configUpdate.onTaskComplete;
            if (typeof configUpdate.onTaskFailed === 'function')
                config.onTaskFailed = configUpdate.onTaskFailed;
            if (typeof configUpdate.onFinished === 'function')
                config.onFinished = configUpdate.onFinished;
        },
        parseTasks: (collection) => {
            const format = utils.getTaskType(collection);
            if (format.isArray) {
                collection.forEach(item => {
                    if (typeof item === 'object')
                        tasks.push(item);
                    if (typeof item === 'function')
                        tasks.push(utils.wrapTask(item));
                });
            }
            if (format.isNamedArray) {
                Object.keys(collection).forEach(key => {
                    const item = collection[key];
                    if (typeof item === 'object')
                        tasks.push(item, key);
                    if (typeof item === 'function')
                        tasks.push(utils.wrapTask(item), key);
                });
            }
            tasks.set({ total: tasks.stack.length });
        },
        parseRollbacks: (collection) => {
            const format = utils.getTaskType(collection || {});
            if (format.isArray) {
                collection.forEach(item => {
                    if (typeof item === 'object')
                        rollbacks.push(item);
                    if (typeof item === 'function')
                        rollbacks.push(utils.wrapTask(item));
                });
            }
            if (format.isNamedArray) {
                Object.keys(collection || {}).forEach(key => {
                    const item = collection[key];
                    if (typeof item === 'object')
                        rollbacks.push(item, key);
                    if (typeof item === 'function')
                        rollbacks.push(utils.wrapTask(item), key);
                });
            }
            rollbacks.set({ total: rollbacks.stack.length });
        },
    };
    const log = (log) => config.useLogger(log);
    const init = () => {
        parsers.parseConfig(props);
        parsers.parseTasks(props.tasks);
        parsers.parseRollbacks(props.rollbacks);
        return run();
    };
    const run = () => new Promise((resolve, reject) => (() => __awaiter(void 0, void 0, void 0, function* () {
        let taskIndex = 0;
        let taskName = '';
        let taskLabel = '';
        let taskTimer;
        events.onStarting();
        for (taskIndex; taskIndex < tasks.total; taskIndex++) {
            if (!state.isRunning)
                return;
            taskName = tasks.stack[taskIndex].name;
            taskLabel = `task ${taskIndex + 1} of ${tasks.total} "${taskName}"`;
            state.set({
                taskIndex,
                taskName,
                taskLabel,
            });
            events.onTaskStart();
            if (config.timeout) {
                taskTimer = setTimeout(() => {
                    reject('Timed out');
                }, config.timeout);
            }
            yield tasks.stack[taskIndex].task(state.get())
                .then(events.onTaskComplete)
                .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
                events.onTaskFailed(error);
                if (rollbacks.total) {
                    clearTimeout(taskTimer);
                    yield rollback(taskIndex);
                }
                reject(tasks.stack[taskIndex]);
            }))
                .finally(() => {
                if (config.timeout)
                    clearTimeout(taskTimer);
            });
        }
        events.onFinished();
        resolve(tasks.stack);
    }))());
    const rollback = (fromTaskIndex) => new Promise((resolve, reject) => (() => __awaiter(void 0, void 0, void 0, function* () {
        let taskIndex = fromTaskIndex;
        let taskName = '';
        let taskLabel = '';
        let taskTimer;
        events.onStartingRollback();
        for (taskIndex; taskIndex >= 0; taskIndex--) {
            if (!state.isRunning)
                return;
            taskName = rollbacks.stack[taskIndex].name;
            taskLabel = `rollback ${taskIndex + 1} of ${rollbacks.total} "${taskName}"`;
            state.set({
                taskIndex,
                taskName,
                taskLabel,
            });
            events.onRollbackTaskStart();
            if (config.timeout) {
                taskTimer = setTimeout(() => {
                    reject('Timed out');
                }, config.timeout);
            }
            yield rollbacks.stack[taskIndex].task(state.get())
                .then(events.onRollbackTaskComplete)
                .catch(error => {
                events.onRollbackTaskFailed(error);
                if (config.shouldRollbackInSeries) {
                    reject(rollbacks.stack[taskIndex]);
                }
            })
                .finally(() => {
                if (config.timeout)
                    clearTimeout(taskTimer);
            });
        }
        events.onRollbackFinished();
        resolve(rollbacks.stack);
    }))());
    return init();
};
exports.promiseSeries = promiseSeries;
