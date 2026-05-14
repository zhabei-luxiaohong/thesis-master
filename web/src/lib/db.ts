import * as path from 'path';
import * as fs from 'fs';
const Database = require('better-sqlite3');
const DB_PATH = path.join(process.cwd(), 'data', 'thesis-master.db');
let db: any = null;
export function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
      CREATE TABLE IF NOT EXISTS theses (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, type TEXT DEFAULT 'MBA', status TEXT DEFAULT 'draft', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id));
      CREATE TABLE IF NOT EXISTS chapters (id TEXT PRIMARY KEY, thesis_id TEXT NOT NULL, title TEXT NOT NULL, sort_order INTEGER NOT NULL, content TEXT DEFAULT '', status TEXT DEFAULT 'pending', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (thesis_id) REFERENCES theses(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, thesis_id TEXT NOT NULL, chapter_id TEXT, role TEXT NOT NULL CHECK(role IN ('user','assistant')), content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (thesis_id) REFERENCES theses(id) ON DELETE CASCADE);
    `);
  }
  return db;
}
export function closeDb() { if (db) db.close(); }
