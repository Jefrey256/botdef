import Database from "better-sqlite3";

export const db = new Database("bot.db");

// tabelas
db.prepare(`
CREATE TABLE IF NOT EXISTS mutes (
  user TEXT,
  groupId TEXT,
  expire INTEGER
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS settings (
  groupId TEXT PRIMARY KEY,
  antilink INTEGER DEFAULT 0
)
`).run();