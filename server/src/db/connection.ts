import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import path from 'path';

let pool: Pool | null = null;
let sqliteDb: sqlite3.Database | null = null;
let isPostgres = false;

export async function initDb() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    console.log('Connecting to PostgreSQL database via DATABASE_URL...');
    pool = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
    });
    isPostgres = true;
    try {
      const client = await pool.connect();
      client.release();
      console.log('PostgreSQL database connected successfully.');
    } catch (err) {
      console.error('Failed to connect to PostgreSQL. Falling back to SQLite.', err);
      setupSQLite();
    }
  } else {
    setupSQLite();
  }
}

function setupSQLite() {
  console.log('Initializing local SQLite database...');
  const dbPath = path.join(__dirname, '../../database.db');
  sqliteDb = new sqlite3.Database(dbPath);
  isPostgres = false;
  console.log(`SQLite database file loaded at ${dbPath}`);
}

export async function query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  if (isPostgres && pool) {
    try {
      const res = await pool.query(sql, params);
      return { rows: res.rows, rowCount: res.rowCount || 0 };
    } catch (err) {
      console.error('PostgreSQL Query Error:', err, 'SQL:', sql);
      throw err;
    }
  } else if (sqliteDb) {
    // Translate PostgreSQL parameters $1, $2, $3... to SQLite '?'
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    return new Promise((resolve, reject) => {
      sqliteDb!.all(sqliteSql, params, (err, rows) => {
        if (err) {
          console.error('SQLite Query Error:', err, 'SQL:', sqliteSql);
          reject(err);
        } else {
          resolve({ rows: rows || [], rowCount: (rows || []).length });
        }
      });
    });
  } else {
    throw new Error('Database not initialized');
  }
}

export function isPg(): boolean {
  return isPostgres;
}
