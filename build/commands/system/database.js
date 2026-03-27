"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
exports.db = new better_sqlite3_1.default("bot.db");
// tabelas
exports.db.prepare(`
CREATE TABLE IF NOT EXISTS mutes (
  user TEXT,
  groupId TEXT,
  expire INTEGER
)
`).run();
exports.db.prepare(`
CREATE TABLE IF NOT EXISTS settings (
  groupId TEXT PRIMARY KEY,
  antilink INTEGER DEFAULT 0
)
`).run();
