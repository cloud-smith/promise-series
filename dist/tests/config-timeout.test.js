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
it('should run array series with a timeout', () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield (0, __1.promiseSeries)({
        useLogging: false,
        timeout: 1000,
        tasks: [
            () => (0, __1.dummyTask)({ delay: 100 }),
            () => (0, __1.dummyTask)({ delay: 100 }),
            () => (0, __1.dummyTask)({ delay: 100 }),
        ],
    });
    expect(JSON.stringify(results)).toStrictEqual("{\"isTasksSuccessful\":true,\"isRollbacksSuccessful\":false,\"errors\":{\"tasks\":[],\"rollbacks\":[]},\"tasks\":[{\"number\":1,\"name\":\"task-1\",\"results\":\"Task Success\"},{\"number\":2,\"name\":\"task-2\",\"results\":\"Task Success\"},{\"number\":3,\"name\":\"task-3\",\"results\":\"Task Success\"}],\"rollbacks\":[]}");
}));
it('should fail array series with a timeout', () => __awaiter(void 0, void 0, void 0, function* () {
    expect.assertions(1);
    try {
        yield (0, __1.promiseSeries)({
            useLogging: false,
            timeout: 1000,
            tasks: [
                () => (0, __1.dummyTask)({ delay: 100 }),
                () => (0, __1.dummyTask)({ delay: 1500 }),
                () => (0, __1.dummyTask)({ delay: 100 }),
            ],
        });
    }
    catch (error) {
        expect(JSON.stringify(error)).toStrictEqual("{\"isTasksSuccessful\":false,\"isRollbacksSuccessful\":false,\"errors\":{\"tasks\":[{\"number\":2,\"name\":\"task-2\",\"error\":\"Task timed out\"}],\"rollbacks\":[]},\"tasks\":[{\"number\":1,\"name\":\"task-1\",\"results\":\"Task Success\"},{\"number\":2,\"name\":\"task-2\",\"error\":\"Task timed out\"},{\"number\":3,\"name\":\"task-3\"}],\"rollbacks\":[]}");
    }
}));
