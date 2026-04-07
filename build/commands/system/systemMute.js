"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMute = addMute;
exports.removeMute = removeMute;
exports.isMuted = isMuted;
const fs_1 = __importDefault(require("fs"));
const path = "../../../database/json/mute.json";
function readDB() {
    return JSON.parse(fs_1.default.readFileSync(path, "utf-8"));
}
function saveDB(data) {
    fs_1.default.writeFileSync(path, JSON.stringify(data, null, 2));
}
function addMute(user, group, time) {
    const db = readDB();
    const expires = Date.now() + time;
    db.push({
        user,
        group,
        expires
    });
    saveDB(db);
}
function removeMute(user, group) {
    let db = readDB();
    db = db.filter((m) => !(m.user === user && m.group === group));
    saveDB(db);
}
// Verificar mute
function isMuted(user, group) {
    const db = readDB();
    const mute = db.find((m) => m.user === user && m.group === group);
    if (!mute)
        return false;
    // Expirou?
    if (Date.now() > mute.expires) {
        removeMute(user, group);
        return false;
    }
    return true;
}
