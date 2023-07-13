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
const promiseSeries = (seriesConfig) => {
    const config = Object.assign({ logging: true }, seriesConfig);
    let state = {
        error: '',
        isRunning: false,
        isComplete: false,
        tasks: {},
        results: {},
        taskCount: 0,
        taskIndex: 0,
        taskName: '',
    };
    const setState = (stateUpdate) => {
        state = stateUpdate;
        if (config.onStateChange)
            config.onStateChange(state);
    };
    const logger = config.logger ||
        function (data) {
            if (!config.logging)
                return;
            // eslint-disable-next-line no-console
            console.log(data);
        };
    const parseTasks = (tasks) => {
        let namedTasks = {};
        const isTasksArray = Array.isArray(tasks);
        const isNamedTasksObject = !isTasksArray && typeof tasks === 'object' && Object.keys(tasks).length
            ? true
            : false;
        if (isTasksArray) {
            tasks.forEach((task, taskNumber) => {
                namedTasks[`task-${taskNumber + 1}`] = task;
            });
        }
        if (isNamedTasksObject) {
            namedTasks = tasks;
        }
        return namedTasks;
    };
    const run = (tasks) => new Promise((resolve, reject) => (() => __awaiter(void 0, void 0, void 0, function* () {
        const parsedTasks = parseTasks(tasks);
        const taskKeys = Object.keys(parsedTasks);
        const taskCount = taskKeys.length;
        setState(Object.assign(Object.assign({}, state), { tasks: parsedTasks, taskCount, isRunning: true, isComplete: false, taskIndex: 0, taskName: '' }));
        yield runner(taskKeys)
            .then(results => {
            logger('finished');
            resolve(results);
        })
            .catch(error => {
            logger('failed');
            reject(error);
        });
    }))());
    const runner = (taskKeys) => new Promise((resolve, reject) => (() => __awaiter(void 0, void 0, void 0, function* () {
        let taskIndex = 0;
        let taskName = '';
        let messageLabel = '';
        logger(`starting...`);
        for (taskIndex; taskIndex < taskKeys.length; taskIndex++) {
            taskName = taskKeys[taskIndex];
            messageLabel = `task ${taskIndex + 1} of ${state.taskCount}: ${taskName}`;
            if (state.error)
                return;
            logger(`${messageLabel}, starting`);
            setState(Object.assign(Object.assign({}, state), { taskName }));
            yield state.tasks[taskName](state)
                // eslint-disable-next-line no-loop-func
                .then(results => {
                logger(`${messageLabel}, finished`);
                setState(Object.assign(Object.assign({}, state), { results: Object.assign(Object.assign({}, state.results), { [taskName]: results }) }));
            })
                // eslint-disable-next-line no-loop-func
                .catch(error => {
                logger(`${messageLabel}, failed`);
                setState(Object.assign(Object.assign({}, state), { isRunning: false, isComplete: true, error }));
                reject(error);
            });
            if (taskIndex + 1 === state.taskCount) {
                setState(Object.assign(Object.assign({}, state), { taskName: '', isRunning: false, isComplete: true }));
                resolve(state.results);
            }
        }
    }))());
    return Object.assign(Object.assign({}, state), { run });
};
exports.promiseSeries = promiseSeries;
