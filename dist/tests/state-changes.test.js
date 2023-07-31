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
    expect(JSON.stringify(statesWithoutTasks)).toStrictEqual("[{\"config\":{},\"isRunning\":true,\"isComplete\":false,\"isTasksComplete\":false,\"isRollbacksComplete\":false,\"rollbacks\":[],\"current\":{},\"errors\":{\"tasks\":null,\"rollbacks\":null}},{\"config\":{},\"isRunning\":true,\"isComplete\":false,\"isTasksComplete\":false,\"isRollbacksComplete\":false,\"rollbacks\":[],\"current\":{\"taskLabel\":\"task 1 of 1 \\\"task-1\\\"\",\"task\":{\"number\":1,\"name\":\"task-1\"}},\"errors\":{\"tasks\":null,\"rollbacks\":null}},{\"config\":{},\"isRunning\":false,\"isComplete\":true,\"isTasksComplete\":false,\"isRollbacksComplete\":false,\"rollbacks\":[],\"current\":{\"taskLabel\":\"task 1 of 1 \\\"task-1\\\"\",\"task\":{\"number\":1,\"name\":\"task-1\"}},\"errors\":{\"tasks\":null,\"rollbacks\":null},\"collection\":\"\",\"taskIndex\":0,\"taskName\":\"\",\"taskLabel\":\"\"}]");
}));
