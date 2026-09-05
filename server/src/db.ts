import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL not set in environment');
}

export const pool = new Pool({
  connectionString,
  // Let pg and Neon handle SSL when connection string has sslmode=require
  // Optionally set statement_timeout, idleTimeoutMillis etc.
});

export async function query<T = any>(sql: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query<T>(sql, params);
    return res;
  } finally {
    client.release();
  }
}