-- JoinEazy Assignment Manager - Database Schema
-- Uses gen_random_uuid() for UUID generation (PostgreSQL 13+)

-- Enable pgcrypto if needed (gen_random_uuid is built-in from PG 13)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  student_id      VARCHAR(50) UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(10) NOT NULL CHECK (role IN ('student', 'admin')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_role     VARCHAR(10) NOT NULL CHECK (member_role IN ('leader', 'member')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id),
  UNIQUE (user_id)  -- a student can be in only one group
);

CREATE TABLE IF NOT EXISTS assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(500) NOT NULL,
  description     TEXT,
  due_date        TIMESTAMPTZ NOT NULL,
  onedrive_link   VARCHAR(2048) NOT NULL,
  target          VARCHAR(10) NOT NULL CHECK (target IN ('all', 'groups')),
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_groups (
  assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (assignment_id, group_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  confirmed_by    UUID NOT NULL REFERENCES users(id),
  confirmed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assignment_id, group_id)
);

-- ============================================================
-- INDEXES on FK columns and due_date
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignment_groups_assignment_id ON assignment_groups(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_groups_group_id ON assignment_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_group_id ON submissions(group_id);
CREATE INDEX IF NOT EXISTS idx_submissions_confirmed_by ON submissions(confirmed_by);
