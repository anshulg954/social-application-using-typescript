"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dev_env_1 = require("./dev.env");
const prod_env_1 = require("./prod.env");
function getEnvironmentVariables() {
    if (process.env.NODE_ENV === 'production') {
        return prod_env_1.ProdEnvironment;
    }
    return dev_env_1.DevEnvironment;
}
exports.getEnvironmentVariables = getEnvironmentVariables;
