// scripts/seed.js - Idempotent seed script
// Creates: 1 admin, 6 students, 2 groups, 4 assignments, some submissions

import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set.');
  process.exit(1);
}

const ssl = DATABASE_URL.includes('sslmode=require') || process.env.DB_SSL === 'true';
const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: ssl ? { rejectUnauthorized: false } : false,
});

const SALT_ROUNDS = 12;

async function seed() {
  await client.connect();
  console.log('✅ Connected to database.');

  // ── Helper: upsert user ──────────────────────────────────────
  const upsertUser = async (name, email, studentId, password, role) => {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await client.query(
      `INSERT INTO users (name, email, student_id, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET name = $1, password_hash = $4
       RETURNING id, name, email, student_id, role`,
      [name, email, studentId, hash, role]
    );
    return rows[0];
  };

  // ── 1. Users ─────────────────────────────────────────────────
  console.log('Seeding users...');
  const admin = await upsertUser('Professor Admin', 'prof@joineazy.test', null, 'Admin@123', 'admin');
  console.log(`  Admin:   ${admin.email} (${admin.id})`);

  const students = [];
  for (let i = 1; i <= 6; i++) {
    const stu = await upsertUser(
      `Student ${i}`,
      `stu${i}@joineazy.test`,
      `STU00${i}`,
      'Student@123',
      'student'
    );
    students.push(stu);
    console.log(`  Student: ${stu.email} / ${stu.student_id} (${stu.id})`);
  }

  // ── 2. Groups ────────────────────────────────────────────────
  console.log('Seeding groups...');

  // Clear existing groups to avoid duplicates on re-seed
  // (cascading deletes handle group_members, assignment_groups, submissions)
  await client.query('DELETE FROM submissions');
  await client.query('DELETE FROM assignment_groups');
  await client.query('DELETE FROM assignments');
  await client.query('DELETE FROM group_members');
  await client.query('DELETE FROM groups');

  const { rows: [group1] } = await client.query(
    `INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING *`,
    ['Alpha Team', students[0].id]
  );
  console.log(`  Group: ${group1.name} (${group1.id})`);

  const { rows: [group2] } = await client.query(
    `INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING *`,
    ['Beta Squad', students[3].id]
  );
  console.log(`  Group: ${group2.name} (${group2.id})`);

  // Add members: Group 1 = stu1 (leader), stu2, stu3
  await client.query(
    `INSERT INTO group_members (group_id, user_id, member_role) VALUES ($1, $2, 'leader')`,
    [group1.id, students[0].id]
  );
  await client.query(
    `INSERT INTO group_members (group_id, user_id, member_role) VALUES ($1, $2, 'member')`,
    [group1.id, students[1].id]
  );
  await client.query(
    `INSERT INTO group_members (group_id, user_id, member_role) VALUES ($1, $2, 'member')`,
    [group1.id, students[2].id]
  );

  // Group 2 = stu4 (leader), stu5, stu6
  await client.query(
    `INSERT INTO group_members (group_id, user_id, member_role) VALUES ($1, $2, 'leader')`,
    [group2.id, students[3].id]
  );
  await client.query(
    `INSERT INTO group_members (group_id, user_id, member_role) VALUES ($1, $2, 'member')`,
    [group2.id, students[4].id]
  );
  await client.query(
    `INSERT INTO group_members (group_id, user_id, member_role) VALUES ($1, $2, 'member')`,
    [group2.id, students[5].id]
  );

  // ── 3. Assignments ──────────────────────────────────────────
  console.log('Seeding assignments...');

  // Assignment 1: target=all, due in future
  const { rows: [a1] } = await client.query(
    `INSERT INTO assignments (title, description, due_date, onedrive_link, target, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      'Week 1: Introduction Report',
      'Write a 2-page introduction report about your team and project goals.',
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      'https://onedrive.live.com/assignment1',
      'all',
      admin.id,
    ]
  );
  console.log(`  Assignment: ${a1.title} (all, future)`);

  // Assignment 2: target=all, overdue
  const { rows: [a2] } = await client.query(
    `INSERT INTO assignments (title, description, due_date, onedrive_link, target, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      'Week 0: Pre-course Survey',
      'Fill out the pre-course survey with your team details.',
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      'https://onedrive.live.com/assignment2-survey',
      'all',
      admin.id,
    ]
  );
  console.log(`  Assignment: ${a2.title} (all, overdue)`);

  // Assignment 3: target=groups (Alpha Team only), due in future
  const { rows: [a3] } = await client.query(
    `INSERT INTO assignments (title, description, due_date, onedrive_link, target, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      'Alpha Special: Design Document',
      'Alpha Team only: submit your system design document.',
      new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
      'https://onedrive.live.com/assignment3-design',
      'groups',
      admin.id,
    ]
  );
  await client.query(
    `INSERT INTO assignment_groups (assignment_id, group_id) VALUES ($1, $2)`,
    [a3.id, group1.id]
  );
  console.log(`  Assignment: ${a3.title} (Alpha Team only, future)`);

  // Assignment 4: target=all, due in future
  const { rows: [a4] } = await client.query(
    `INSERT INTO assignments (title, description, due_date, onedrive_link, target, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      'Week 2: Progress Presentation',
      'Prepare and upload a 10-minute progress presentation.',
      new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), // 28 days from now
      'https://onedrive.live.com/assignment4-pres',
      'all',
      admin.id,
    ]
  );
  console.log(`  Assignment: ${a4.title} (all, future)`);

  // ── 4. Submissions ──────────────────────────────────────────
  console.log('Seeding submissions...');

  // Alpha Team confirmed assignment 1 (by stu1)
  await client.query(
    `INSERT INTO submissions (assignment_id, group_id, confirmed_by) VALUES ($1, $2, $3)`,
    [a1.id, group1.id, students[0].id]
  );
  console.log(`  Submission: Alpha Team → ${a1.title} (by stu1)`);

  // Beta Squad confirmed assignment 2 (overdue, by stu4)
  await client.query(
    `INSERT INTO submissions (assignment_id, group_id, confirmed_by) VALUES ($1, $2, $3)`,
    [a2.id, group2.id, students[3].id]
  );
  console.log(`  Submission: Beta Squad → ${a2.title} (by stu4)`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('  Admin:   prof@joineazy.test / Admin@123');
  console.log('  Student: stu1@joineazy.test / Student@123 (Alpha Team leader)');
  console.log('  Student: stu4@joineazy.test / Student@123 (Beta Squad leader)');

  await client.end();
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
