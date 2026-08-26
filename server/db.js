/**
 * db.js — SQLite via sql.js (pure JavaScript, no native compilation)
 *
 * sql.js works entirely in memory and we persist to disk manually.
 * We use a simple write-on-change pattern with explicit transaction helpers
 * that mimic BEGIN EXCLUSIVE / BEGIN IMMEDIATE semantics for the demo.
 *
 * For a production app you'd use better-sqlite3 or PostgreSQL.
 *
 * Locking strategy (educational demo):
 *   runExclusive(fn) — sets an in-process JS lock flag, preventing
 *                      concurrent calls from overlapping in the same process
 *   runImmediate(fn) — same, but lighter (simulates IMMEDIATE)
 *
 *   In a single-process Node.js server these flags prevent concurrent
 *   order placements from racing on inventory, which is the main LLD goal.
 */

const initSqlJs = require('sql.js');
const path      = require('path');
const fs        = require('fs');

const DB_PATH     = path.join(__dirname, 'food_delivery.db');
const SCHEMA_PATH = path.join(__dirname, 'db', 'schema.sql');

let db   = null;
let SQL  = null;
let _exclusiveLocked = false; // simulates exclusive lock in single process

/** Load or create the database synchronously-ish via sync init wrapper */
async function initDB() {
  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  // Apply schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  // Strip PRAGMA lines sql.js doesn't support
  const safeSchema = schema
    .split('\n')
    .filter(l => !l.trim().startsWith('PRAGMA'))
    .join('\n');

  db.run(safeSchema);
  persist();

  console.log(`[DB] sql.js SQLite ready. File: ${DB_PATH}`);
  return db;
}

/** Persist in-memory DB to disk */
function persist() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Execute a write statement and persist.
 * stmt: SQL string, params: array
 */
function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

/**
 * Execute a SELECT and return all rows as plain objects.
 */
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Execute a SELECT and return first row or undefined.
 */
function get(sql, params = []) {
  return all(sql, params)[0];
}

/**
 * Execute an INSERT and return { lastInsertRowid, changes }
 */
function insert(sql, params = []) {
  db.run(sql, params);
  const lastId  = db.exec('SELECT last_insert_rowid() AS id')[0]?.values[0]?.[0];
  persist();
  return { lastInsertRowid: lastId };
}

/**
 * runExclusive(fn) — Mimics BEGIN EXCLUSIVE in a single Node.js process.
 * Prevents two concurrent async calls from interleaving during order placement.
 */
function runExclusive(fn) {
  return async (...args) => {
    if (_exclusiveLocked) {
      throw Object.assign(new Error('Database is busy, please try again'), { status: 503 });
    }
    _exclusiveLocked = true;
    try {
      const result = fn(...args);
      persist();
      return result;
    } finally {
      _exclusiveLocked = false;
    }
  };
}

/**
 * runImmediate(fn) — Lighter version for status updates.
 */
function runImmediate(fn) {
  return async (...args) => {
    const result = fn(...args);
    persist();
    return result;
  };
}

module.exports = { initDB, run, all, get, insert, persist, runExclusive, runImmediate };
