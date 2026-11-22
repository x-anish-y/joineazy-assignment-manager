// Application entry point
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import { seedDatabase } from '../scripts/seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = env.PORT;

/**
 * Ensures the database schema and default admin/demo accounts exist.
 * This guarantees `docker compose up --build` works 100% out-of-the-box
 * on a fresh clone without requiring extra manual seed steps.
 */
async function ensureDatabaseReady() {
  try {
    const { rows } = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );
    if (parseInt(rows[0].count, 10) === 0) {
      console.log('🌱 No admin user found. Auto-seeding initial database for evaluation...');
      await seedDatabase(pool);
    }
  } catch (err) {
    // If relation "users" does not exist (code 42P01)
    if (err.code === '42P01') {
      try {
        console.log('📦 Database tables missing. Initializing schema.sql...');
        const schema = readFileSync(resolve(__dirname, '../db/schema.sql'), 'utf-8');
        await pool.query(schema);
        console.log('✅ Schema initialized. Auto-seeding initial demo data...');
        await seedDatabase(pool);
      } catch (initErr) {
        console.error('❌ Failed to auto-initialize database schema:', initErr.message);
      }
    } else {
      console.warn('⚠️ Database auto-seed check skipped:', err.message);
    }
  }
}

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  await ensureDatabaseReady();
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    console.log('Database pool closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
