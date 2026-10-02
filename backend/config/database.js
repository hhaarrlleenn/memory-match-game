const Database = require("better-sqlite3");

const db = new Database("memorygame.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL,
    moves INTEGER NOT NULL,
    time INTEGER NOT NULL,
    won INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

console.log("SQLite database connected");

const getDatabase = () => db;

module.exports = {
  getDatabase
};