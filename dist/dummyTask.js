"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dummyTask = void 0;
const dummyTask = ({ delay, shouldFail, state }) => new Promise((resolve, reject) => {
    setTimeout(() => {
        if (state)
            console.log('Task State: ', state);
        if (shouldFail)
            reject(`Task simulated failure`);
        else
            resolve(`Task Success`);
    }, delay);
});
exports.dummyTask = dummyTask;
