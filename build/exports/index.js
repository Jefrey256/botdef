"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.question = void 0;
const pino_1 = __importDefault(require("pino"));
const readline_1 = __importDefault(require("readline"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (text) => {
    return new Promise((resolve) => {
        rl.question(text, resolve);
    });
};
exports.question = question;
const logger = (0, pino_1.default)({
    level: 'silent'
});
exports.logger = logger;
