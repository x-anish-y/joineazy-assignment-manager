# System Architecture & Technical Specifications

This document describes the end-to-end architecture, request pipeline, security layers, and data workflows of **AssignHub (JoinEazy Assignment Manager)**.

- **Live Frontend Application**: [https://joineazy-assignment-manager.vercel.app/login](https://joineazy-assignment-manager.vercel.app/login)
- **Live Backend API**: [https://joineazy-backend-9pam.onrender.com](https://joineazy-backend-9pam.onrender.com)
- **API Health Endpoint**: [https://joineazy-backend-9pam.onrender.com/api/health](https://joineazy-backend-9pam.onrender.com/api/health)

---

## 1. End-to-End Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Browser)"]
        UI["React 18 SPA (Vite + Tailwind)"]
        Router["React Router v6"]
        AuthCtx["AuthContext (JWT in localStorage)"]
        Axios["Axios Client (Bearer Interceptor + 401 Redirect)"]
        UI --> Router
        Router --> AuthCtx
        AuthCtx --> Axios
    end

    subgraph Gateway ["Express API Gateway (:5000)"]
        direction TB
        MW1["Helmet (Security Headers)"]
        MW2["CORS Middleware (Env Whitelist)"]
        MW3["Express JSON Parser"]
        MW4["Rate Limiter (General: 1000/15m, Auth: 100/15m)"]
        MW5["auth.js (JWT verify + User DB Hydration)"]
        MW6["requireRole.js (student | admin)"]
        MW7["validate.js (Zod Schema Validation)"]
        MW1 --> MW2 --> MW3 --> MW4 --> MW5 --> MW6 --> MW7
    end

    subgraph Controllers ["Controllers Layer"]
        C1["auth.controller.js"]
        C2["group.controller.js"]
        C3["assignment.controller.js"]
        C4["submission.controller.js"]
        C5["analytics.controller.js"]
    end

    subgraph Services ["Services Layer (Raw SQL Business Logic)"]
        S1["group.service.js"]
        S2["assignment.service.js"]
        S3["submission.service.js"]
        S4["analytics.service.js"]
    end

    subgraph Database ["Data Tier (PostgreSQL 16 / Neon)"]
        PG[("PostgreSQL Database
        (pg.Pool + SSL)")]
        Tables[("users
        groups
        group_members
        assignments
        assignment_groups
        submissions")]
        PG --- Tables
    end

    Axios -->|"HTTPS / JSON"| MW1
    MW7 -->|"Validated req.validated & req.user"| Controllers
    C1 --> S1 & S4
    C2 --> S1
    C3 --> S2
    C4 --> S3
    C5 --> S4
    Services -->|"Atomic SQL / Transactions"| PG
```

---

## 2. JWT Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Professor
    participant Client as React SPA (Login.jsx)
    participant AuthMW as Express API (/api/auth)
    participant DB as PostgreSQL
    participant Storage as localStorage

    User->>Client: Enters email and password
    Client->>AuthMW: POST /api/auth/login { email, password }
    AuthMW->>DB: SELECT id, password_hash, role FROM users WHERE email = $1
    DB-->>AuthMW: Returns user row
    AuthMW->>AuthMW: bcrypt.compare(password, password_hash)
    alt Password Invalid
        AuthMW-->>Client: 401 Unauthorized { success: false, error }
        Client-->>User: Displays inline error
    else Password Valid
        AuthMW->>AuthMW: jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' })
        AuthMW-->>Client: 200 OK { token, user }
        Client->>Storage: Store token & user JSON
        Client->>Client: AuthContext state update & role redirect
        Client-->>User: Redirect to /admin/dashboard or /student/dashboard
    end

    Note over Client, AuthMW: Subsequent Protected Requests
    User->>Client: Navigates to protected view
    Client->>AuthMW: GET /api/assignments (Header: Authorization Bearer <token>)
    AuthMW->>AuthMW: jwt.verify(token, JWT_SECRET)
    AuthMW->>DB: SELECT id, name, email, role FROM users WHERE id = $1
    DB-->>AuthMW: User record
    AuthMW->>AuthMW: requireRole('student') check
    AuthMW-->>Client: 200 OK { success: true, data }
```

---

## 3. Two-Step Submission Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Any Group Member)
    participant UI as AssignmentDetail.jsx
    participant Modal as Confirm Modal
    participant API as Submission Controller
    participant DB as PostgreSQL (submissions table)

    Student->>UI: Views assignment details & OneDrive link
    UI-->>Student: Displays "Open OneDrive Folder"
    Student->>Student: Uploads deliverables to OneDrive
    Student->>UI: Clicks Step 1: "Yes, I have submitted"
    UI->>Modal: Opens Step 2 Modal ("Confirm submission for Alpha Team? This cannot be undone.")
    Student->>Modal: Clicks "Confirm Submission"
    Modal->>API: POST /api/assignments/:id/confirm (Bearer Token)
    API->>DB: Check student belongs to a group
    API->>DB: Check assignment is targeted at this group
    API->>DB: Check if submission already exists (UNIQUE check)
    alt Already Submitted
        DB-->>API: Conflict found
        API-->>Modal: 409 Conflict ("Submission already confirmed")
        Modal-->>Student: Error toast
    else First Submission
        API->>DB: INSERT INTO submissions (assignment_id, group_id, confirmed_by, confirmed_at)
        DB-->>API: Inserted row
        API-->>Modal: 201 Created { success: true, data: { submission } }
        Modal->>UI: Close modal & trigger refetch
        UI-->>Student: Green banner: "Submission Confirmed" with confirmed_by and timestamp
    end
```

---

## 4. Architectural Layer Responsibilities

### 1. Presentation Layer (`frontend/`)
- Built using **React 18** and **Vite** for rapid HMR and optimized tree-shaken builds.
- Styled with **Tailwind CSS v4** design tokens (indigo primary, slate neutrals, rounded-xl cards).
- Visual analytics driven by **Recharts** (donut completion charts, responsive bar charts).
- Fully responsive navigation with off-canvas drawer for mobile screens (375px+).

### 2. API Gateway & Middleware (`backend/src/middleware/`)
- **`helmet`**: Configures strict HTTP security headers.
- **`cors`**: Whitelists frontend origins from environment variables.
- **`rateLimit`**: Enforces general (1000/15min) and sensitive auth rate limits (100/15min) preventing brute force attacks.
- **`auth`**: Decodes and verifies JWT tokens, then hydratres fresh user data from PostgreSQL.
- **`requireRole`**: Declarative role-based access control protecting routes from unauthorized access.
- **`validate`**: Validates incoming payload shapes via **Zod** schemas, short-circuiting malformed requests before touching controllers.
- **`errorHandler`**: Catches synchronous and asynchronous exceptions (`asyncHandler`), mapping `ApiError` instances to uniform JSON envelopes.

### 3. Business Logic & Services (`backend/src/services/`)
- All database queries live strictly inside services using raw SQL queries with parameterized inputs (`$1`, `$2`), completely immunizing the system against SQL injection.
- Zero ORM overhead provides sub-millisecond execution times and deterministic query planning.
- Database transactions (`BEGIN` / `COMMIT` / `ROLLBACK`) ensure atomic operations for group creation and multi-target assignment provisioning.
