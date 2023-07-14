"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dummyTask = void 0;
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
exports.dummyTask = dummyTask;
