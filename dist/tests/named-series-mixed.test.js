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
it('should run mixed task types using a named array', () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield (0, __1.promiseSeries)({
        useLogging: false,
        tasks: {
            getApples: () => (0, __1.dummyTask)({ delay: 100 }),
            getOrganges: () => (0, __1.dummyTask)({ delay: 100 }),
            getGrapes: () => (0, __1.dummyTask)({ delay: 100 }),
            getNoneAsync: () => {
                const result = 'non-async task success';
                console.log(result);
                return result;
            }
        },
    });
    expect(JSON.stringify(results)).toStrictEqual("{\"isTasksSuccessful\":true,\"isRollbacksSuccessful\":false,\"errors\":{\"tasks\":[],\"rollbacks\":[]},\"tasks\":[{\"number\":1,\"name\":\"getApples\",\"results\":\"Task Success\"},{\"number\":2,\"name\":\"getOrganges\",\"results\":\"Task Success\"},{\"number\":3,\"name\":\"getGrapes\",\"results\":\"Task Success\"},{\"number\":4,\"name\":\"getNoneAsync\",\"results\":\"non-async task success\"}],\"rollbacks\":[]}");
}));
