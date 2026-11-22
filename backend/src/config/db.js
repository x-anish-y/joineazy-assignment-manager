import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

const poolConfig = {
  connectionString: env.DATABASE_URL,
};

if (env.DB_SSL) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Helper: run a query and return rows
 */
export const query = (text, params) => pool.query(text, params);
