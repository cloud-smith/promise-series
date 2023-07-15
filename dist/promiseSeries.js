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
    const config = {
        useLogging: false,
    };
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
    const events = {
        onStateChange: undefined,
        onComplete: undefined,
        onError: undefined,
    };
    const parsers = {
        parseConfig: () => {
            var _a;
            config.useLogging = typeof ((_a = props.config) === null || _a === void 0 ? void 0 : _a.useLogging) === 'boolean' ? props.config.useLogging : config.useLogging;
        },
        parseTasks: () => {
            const tasks = props.tasks;
            const results = {
                tasks: {},
                keys: [],
            };
            const isArraySeries = Array.isArray(tasks);
            const isNamedArraySeries = !isArraySeries && typeof tasks === 'object' && Object.keys(tasks).length
                ? true
                : false;
            const addTask = (name, task) => (results.tasks[name] = task);
            const wrapFunctionWithPromsie = (task) => (state) => new Promise((resolve, reject) => {
                try {
                    const result = task(state);
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
            });
            const parseArraySeries = () => {
                tasks.forEach((task, taskNumber) => {
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
                    if (typeof tasks[key] === 'object')
                        addTask(key, tasks[key]);
                    if (typeof tasks[key] === 'function')
                        addTask(key, wrapFunctionWithPromsie(tasks[key]));
                });
            };
            if (isArraySeries)
                parseArraySeries();
            if (isNamedArraySeries)
                parseNamedArraySeries();
            state.tasks = results.tasks;
            state.taskCount = results.keys.length;
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
    const setState = (stateUpdate) => {
        state = Object.assign(Object.assign({}, state), stateUpdate);
        if (events.onStateChange)
            events.onStateChange(state);
    };
    const logger = (data) => {
        if (!config.useLogging)
            return;
        // eslint-disable-next-line no-console
        console.log(data);
    };
    const initPromsieSeries = () => {
        parsers.parseConfig();
        parsers.parseTasks();
        parsers.parseEventHandlers();
        return runPromsieSeries();
    };
    const runPromsieSeries = () => new Promise((resolve, reject) => (() => __awaiter(void 0, void 0, void 0, function* () {
        const onLoading = () => setState(Object.assign(Object.assign({}, state), { isRunning: true, isComplete: false, taskIndex: 0, taskName: '' }));
        const onComplete = (results) => {
            logger('finished');
            resolve(results);
        };
        const onError = (error) => {
            logger('failed');
            reject(error);
        };
        onLoading();
        yield promsieSeriesRunner().then(onComplete).catch(onError);
    }))());
    const promsieSeriesRunner = () => new Promise((resolve, reject) => (() => __awaiter(void 0, void 0, void 0, function* () {
        const keys = Object.keys(state.tasks);
        let taskIndex = 0;
        let taskName = '';
        let messageLabel = '';
        logger(`starting...`);
        for (taskIndex; taskIndex < keys.length; taskIndex++) {
            taskName = keys[taskIndex];
            messageLabel = `task ${taskIndex + 1} of ${state.taskCount}: ${taskName}`;
            if (state.error)
                return;
            logger(`${messageLabel}, starting`);
            setState(Object.assign(Object.assign({}, state), { taskName,
                taskIndex }));
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
    return initPromsieSeries();
};
exports.promiseSeries = promiseSeries;
