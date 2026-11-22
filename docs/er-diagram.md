# Database Architecture & Entity-Relationship Model

This document outlines the data model, relational constraints, and indexing strategy for the **JoinEazy Assignment Manager**.

---

## Mermaid ER Diagram

```mermaid
erDiagram
    users {
        uuid id PK "gen_random_uuid()"
        varchar name "NOT NULL"
        varchar email UK "NOT NULL, UNIQUE"
        varchar student_id UK "UNIQUE, NULLABLE"
        varchar password_hash "NOT NULL (bcrypt)"
        varchar role "CHECK (student, admin)"
        timestamptz created_at "DEFAULT NOW()"
    }

    groups {
        uuid id PK "gen_random_uuid()"
        varchar name "NOT NULL"
        uuid created_by FK "REFERENCES users(id)"
        timestamptz created_at "DEFAULT NOW()"
    }

    group_members {
        uuid group_id PK,FK "REFERENCES groups(id) ON DELETE CASCADE"
        uuid user_id PK,FK "REFERENCES users(id) ON DELETE CASCADE, UNIQUE"
        varchar member_role "CHECK (leader, member)"
        timestamptz joined_at "DEFAULT NOW()"
    }

    assignments {
        uuid id PK "gen_random_uuid()"
        varchar title "NOT NULL"
        text description "NULLABLE"
        timestamptz due_date "NOT NULL"
        varchar onedrive_link "NOT NULL (HTTPS URL)"
        varchar target "CHECK (all, groups)"
        uuid created_by FK "REFERENCES users(id)"
        timestamptz created_at "DEFAULT NOW()"
        timestamptz updated_at "DEFAULT NOW()"
    }

    assignment_groups {
        uuid assignment_id PK,FK "REFERENCES assignments(id) ON DELETE CASCADE"
        uuid group_id PK,FK "REFERENCES groups(id) ON DELETE CASCADE"
    }

    submissions {
        uuid id PK "gen_random_uuid()"
        uuid assignment_id FK "REFERENCES assignments(id) ON DELETE CASCADE"
        uuid group_id FK "REFERENCES groups(id) ON DELETE CASCADE"
        uuid confirmed_by FK "REFERENCES users(id)"
        timestamptz confirmed_at "DEFAULT NOW()"
    }

    users ||--o{ groups : "creates"
    users ||--o{ group_members : "belongs to"
    groups ||--o{ group_members : "contains"
    users ||--o{ assignments : "creates (admin)"
    assignments ||--o{ assignment_groups : "targets"
    groups ||--o{ assignment_groups : "targeted by"
    assignments ||--o{ submissions : "has"
    groups ||--o{ submissions : "submits"
    users ||--o{ submissions : "confirms"
```

---

## Schema Constraints Matrix

| Table | Constraint Type | Constraint Definition | Business Rule Enforced |
|---|---|---|---|
| `users` | Primary Key | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` | Universally unique user identifier |
| `users` | Unique Key | `UNIQUE (email)` | One account per university email |
| `users` | Unique Key | `UNIQUE (student_id)` | One account per university student ID (nullable for admin) |
| `users` | Check Constraint | `CHECK (role IN ('student', 'admin'))` | Strict role boundary |
| `groups` | Foreign Key | `created_by REFERENCES users(id)` | Audit trail of group creator |
| `group_members` | Primary Key | `PRIMARY KEY (group_id, user_id)` | Composite identifier for membership |
| `group_members` | **Unique Constraint** | **`UNIQUE (user_id)`** | **Core Rule**: A student can belong to at most **ONE** group |
| `group_members` | Foreign Key | `group_id REFERENCES groups(id) ON DELETE CASCADE` | Deleting a group cascades to all member records |
| `group_members` | Check Constraint | `CHECK (member_role IN ('leader', 'member'))` | Only leader or member roles allowed |
| `assignments` | Check Constraint | `CHECK (target IN ('all', 'groups'))` | Either broadcast to all or targeted to specific groups |
| `assignment_groups` | Primary Key | `PRIMARY KEY (assignment_id, group_id)` | Junction table preventing duplicate targeting |
| `assignment_groups` | Foreign Key | `ON DELETE CASCADE` on both keys | Automatic cleanup on assignment or group deletion |
| `submissions` | **Unique Constraint** | **`UNIQUE (assignment_id, group_id)`** | **Core Rule**: A group can submit an assignment exactly **ONCE** |
| `submissions` | Foreign Key | `confirmed_by REFERENCES users(id)` | Audit trail recording which group member confirmed submission |

---

## Indexing Strategy

Indexes are explicitly defined on all foreign keys, status lookups, and query sorting targets to prevent table scans:

```sql
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_assignments_created_by ON assignments(created_by);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignment_groups_assignment_id ON assignment_groups(assignment_id);
CREATE INDEX idx_assignment_groups_group_id ON assignment_groups(group_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_group_id ON submissions(group_id);
CREATE INDEX idx_submissions_confirmed_by ON submissions(confirmed_by);
```

- **`idx_group_members_user_id`**: Sub-millisecond lookup for checking student group membership during auth and route access.
- **`idx_assignments_due_date`**: Accelerates deadline sorting and overdue calculation queries.
- **`idx_submissions_assignment_id` & `idx_submissions_group_id`**: Powers real-time analytics aggregation and status tracking queries without sequential scans.
