"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseSeries = void 0;
const _1 = require("./");
const promiseSeries = (props) => new _1.PromiseSeries(props)
    .promise();
exports.promiseSeries = promiseSeries;
