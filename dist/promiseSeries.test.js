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
const promiseSeries_1 = require("./promiseSeries");
const dummyTask = ({ delay, shouldFail, state }) => new Promise((resolve, reject) => {
    setTimeout(() => {
        if (state)
            console.log(state);
        if (shouldFail)
            reject(`Task Failed`);
        else
            resolve(`Task Success`);
    }, delay);
});
it('should run array series', () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield (0, promiseSeries_1.promiseSeries)({
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
}));
it('should fail array series', () => __awaiter(void 0, void 0, void 0, function* () {
    expect.assertions(1);
    try {
        yield (0, promiseSeries_1.promiseSeries)({
            tasks: [
                () => dummyTask({ delay: 100 }),
                () => dummyTask({ delay: 100, shouldFail: true }),
                () => dummyTask({ delay: 100 }),
            ],
        });
    }
    catch (error) {
        expect(error).toStrictEqual("Task Failed");
    }
}));
it('should run named array series', () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield (0, promiseSeries_1.promiseSeries)({
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
}));
it('should fail array series', () => __awaiter(void 0, void 0, void 0, function* () {
    expect.assertions(1);
    try {
        yield (0, promiseSeries_1.promiseSeries)({
            tasks: {
                getApples: () => dummyTask({ delay: 100 }),
                getOrganges: () => dummyTask({ delay: 100, shouldFail: true }),
                getGrapes: () => dummyTask({ delay: 100 }),
            },
        });
    }
    catch (error) {
        expect(error).toStrictEqual("Task Failed");
    }
}));
it('should run mixed task types', () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield (0, promiseSeries_1.promiseSeries)({
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
}));
it('should return state changes', () => __awaiter(void 0, void 0, void 0, function* () {
    const states = [];
    let statesWithoutTasks = [];
    yield (0, promiseSeries_1.promiseSeries)({
        tasks: [
            () => dummyTask({ delay: 100 }),
        ],
        onStateChange: update => states.push(update),
    });
    statesWithoutTasks = states.map(state => {
        const parsed = Object.assign({}, state);
        delete (parsed.tasks);
        return parsed;
    });
    expect(statesWithoutTasks).toStrictEqual([
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
    ]);
}));
it('should use a custom logger', () => __awaiter(void 0, void 0, void 0, function* () {
    const logs = [];
    const customLogger = (log) => {
        logs.push(log);
        console.log(log);
    };
    yield (0, promiseSeries_1.promiseSeries)({
        config: {
            useLogging: true,
            useLogger: customLogger,
        },
        tasks: [
            () => dummyTask({ delay: 100 }),
        ],
    });
    expect(logs).toStrictEqual(["starting...", "task 1 of 1: task-1, starting", "task 1 of 1: task-1, finished", "finished"]);
}));
