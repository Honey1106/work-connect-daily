const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

function resolveDbFile(dbFileFromEnv) {
  // If user gives an absolute path, keep it; else resolve relative to backend folder.
  if (!dbFileFromEnv) return path.resolve(__dirname, '..', 'data', 'app.sqlite');
  if (path.isAbsolute(dbFileFromEnv)) return dbFileFromEnv;
  return path.resolve(__dirname, '..', dbFileFromEnv);
}

async function openDb() {
  const dbFile = resolveDbFile(process.env.DB_FILE);
  const dbDir = path.dirname(dbFile);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

async function initDb(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('seeker','provider')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      purpose TEXT NOT NULL DEFAULT 'login',
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      consumed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone);

    CREATE TABLE IF NOT EXISTS seeker_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      work_types_json TEXT NOT NULL DEFAULT '[]',
      expected_wage INTEGER,
      hours_availability TEXT,
      custom_hours TEXT,
      available_days_json TEXT NOT NULL DEFAULT '[]',
      location TEXT,
      experience TEXT,
      rating REAL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS provider_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      work_type TEXT,
      budget_per_day INTEGER,
      workers_needed INTEGER,
      working_hours TEXT,
      custom_hours TEXT,
      location TEXT,
      work_start_time TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS job_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL,
      seeker_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
      message TEXT,

      provider_name TEXT NOT NULL,
      provider_phone TEXT NOT NULL,

      work_type TEXT,
      budget_per_day INTEGER,
      location TEXT,
      working_hours TEXT,
      work_start_time TEXT,

      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),

      FOREIGN KEY(provider_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(seeker_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_job_requests_seeker ON job_requests(seeker_id);
    CREATE INDEX IF NOT EXISTS idx_job_requests_provider ON job_requests(provider_id);

    CREATE TABLE IF NOT EXISTS call_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER,
      to_phone TEXT,
      context TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(to_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_call_logs_from_user ON call_logs(from_user_id);
    CREATE INDEX IF NOT EXISTS idx_call_logs_to_user ON call_logs(to_user_id);
  `);
}

module.exports = {
  openDb,
  initDb,
};
