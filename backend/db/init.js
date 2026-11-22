// db/init.js - Run schema.sql against DATABASE_URL
// Usage: node db/init.js          (IF NOT EXISTS, safe to re-run)
//        node db/init.js --reset  (DROP all tables, then recreate)

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const ssl = DATABASE_URL.includes('sslmode=require') || process.env.DB_SSL === 'true';
const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: ssl ? { rejectUnauthorized: false } : false,
});

const isReset = process.argv.includes('--reset');

const DROP_SQL = `
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS assignment_groups CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;
`;

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to database.');

    if (isReset) {
      console.log('⚠️  Dropping all tables...');
      await client.query(DROP_SQL);
      console.log('✅ Tables dropped.');
    }

    const schema = readFileSync(resolve(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schema);
    console.log('✅ Schema applied successfully.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
