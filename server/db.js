const Database = require('better-sqlite3');
const crypto = require('node:crypto');
const path = require('node:path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'crew.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    first_name  TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    school      TEXT NOT NULL,
    grade       INTEGER NOT NULL,
    courses     TEXT NOT NULL DEFAULT '[]',
    is_demo     INTEGER NOT NULL DEFAULT 0,
    demo_seeded INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id             TEXT PRIMARY KEY,
    subject        TEXT NOT NULL,
    starts_at      TEXT NOT NULL,
    duration_min   INTEGER NOT NULL,
    mode           TEXT NOT NULL CHECK (mode IN ('remote', 'in-person')),
    location       TEXT,
    join_url       TEXT,
    host_id        TEXT NOT NULL REFERENCES users(id),
    school         TEXT NOT NULL,
    open_to_course INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS memberships (
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id    TEXT NOT NULL REFERENCES users(id),
    status     TEXT NOT NULL CHECK (status IN ('invited', 'accepted', 'declined')),
    PRIMARY KEY (session_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_school_starts ON sessions(school, starts_at);
`);

function id(prefix) {
  return `${prefix}${crypto.randomUUID().slice(0, 8)}`;
}

module.exports = { db, id };
