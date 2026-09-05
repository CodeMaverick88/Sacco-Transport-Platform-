import fs from 'fs';
import path from 'path';
import { query } from './db';

async function run() {
  const sqlPath = path.join(__dirname, '..', 'db', 'neon_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('neon_schema.sql not found at', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('Running migration...');
  try {
    await query(sql);
    console.log('Migration finished.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();