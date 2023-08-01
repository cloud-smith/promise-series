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
const __1 = require("../");
it('should return state changes', () => __awaiter(void 0, void 0, void 0, function* () {
    const states = [];
    let statesWithoutTasks = [];
    yield (0, __1.promiseSeries)({
        useLogging: false,
        tasks: [
            () => (0, __1.dummyTask)({ delay: 100 }),
        ],
        onStateChange: update => states.push(update),
    });
    statesWithoutTasks = states.map(state => {
        const parsed = Object.assign({}, state);
        delete (parsed.tasks);
        return parsed;
    });
    expect(JSON.stringify(statesWithoutTasks)).toStrictEqual("[{\"config\":{\"useLogging\":false,\"timeout\":30000,\"faultTolerantRollbacks\":true},\"isRunning\":true,\"isComplete\":false,\"isTasksComplete\":false,\"isRollbacksComplete\":false,\"rollbacks\":[],\"current\":{},\"errors\":{\"tasks\":[],\"rollbacks\":[]}},{\"config\":{\"useLogging\":false,\"timeout\":30000,\"faultTolerantRollbacks\":true},\"isRunning\":true,\"isComplete\":false,\"isTasksComplete\":false,\"isRollbacksComplete\":false,\"rollbacks\":[],\"current\":{\"taskLabel\":\"task 1 of 1 \\\"task-1\\\"\",\"task\":{\"number\":1,\"name\":\"task-1\"}},\"errors\":{\"tasks\":[],\"rollbacks\":[]}},{\"config\":{\"useLogging\":false,\"timeout\":30000,\"faultTolerantRollbacks\":true},\"isRunning\":false,\"isComplete\":true,\"isTasksComplete\":false,\"isRollbacksComplete\":false,\"rollbacks\":[],\"current\":{\"taskLabel\":\"task 1 of 1 \\\"task-1\\\"\",\"task\":{\"number\":1,\"name\":\"task-1\"}},\"errors\":{\"tasks\":[],\"rollbacks\":[]},\"collection\":\"\",\"taskIndex\":0,\"taskName\":\"\",\"taskLabel\":\"\"}]");
}));
