"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMuted = getMuted;
exports.setMuted = setMuted;
exports.removeMuted = removeMuted;
exports.saveMuted = saveMuted;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FILE = path_1.default.join(process.cwd(), "assets", "json", "muted.json");
if (!fs_1.default.existsSync(path_1.default.dirname(FILE))) {
    fs_1.default.mkdirSync(path_1.default.dirname(FILE), { recursive: true });
}
if (!fs_1.default.existsSync(FILE)) {
    fs_1.default.writeFileSync(FILE, JSON.stringify({}));
}
let muted = {};
try {
    muted = JSON.parse(fs_1.default.readFileSync(FILE, "utf-8"));
}
catch (_a) {
    muted = {};
}
function getMuted() {
    return muted;
}
function setMuted(user, time) {
    muted[user] = time;
    saveMuted();
}
function removeMuted(user) {
    delete muted[user];
    saveMuted();
}
function saveMuted() {
    fs_1.default.writeFileSync(FILE, JSON.stringify(muted, null, 2));
}
