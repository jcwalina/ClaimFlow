# ClaimFlow — Insurance Claims Workflow

> A production-grade **enterprise workflow application** for health insurance back-office operations:
> role-based access control, server-enforced state transitions, full audit trail, task management, and premium UI.

Built with **React + Express + TypeScript + Prisma + PostgreSQL** in a monorepo architecture.

---

## Application Preview

| | |
|:---:|:---|
| **Login** | **Claims list** |
| ![Login](docs/screenshots/01-login.png) | ![Claims list](docs/screenshots/02-claims-list.png) |
| *Secure sign-in with role-based demo accounts* | *Search, filter, and paginate claims with status and assignment* |
| **Claim detail — Overview** | **Dashboard** |
| ![Claim detail overview](docs/screenshots/03-claim-detail-overview.png) | ![Dashboard](docs/screenshots/04-dashbord.png) |
| *Full claim data, status workflow, and assignment* | *Aggregated stats and quick access to tasks* |
| **Claim detail — Notes** | **Audit log** |
| ![Claim detail notes](docs/screenshots/05-claim-detail-notes.png) | ![Audit log](docs/screenshots/06-audit-log.png) |
| *Notes timeline and task creation per claim* | *Full audit trail with actor, action, and metadata* |
| **Admin — Users** | |
| ![Admin users](docs/screenshots/07-admin-users.png) | |
| *User management and role assignment (Admin only)* | |

### Mobile

| | |
|:---:|:---|
| **Navigation** | **Tasks** |
| ![Navigation mobile](docs/screenshots/08-navi-mobile%20.png) | ![Tasks mobile](docs/screenshots/09-tasks-mobile.png) |
| *Responsive drawer navigation* | *Task list on small screens* |


---

## Live Demo

| | URL |
|--|-----|
| **Web** | `http://localhost:5173` |
| **API** | `http://localhost:4001` |

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demo.com` | `demo123` |
| Supervisor | `supervisor@demo.com` | `demo123` |
| Caseworker | `caseworker@demo.com` | `demo123` |
| Read-only | `readonly@demo.com` | `demo123` |

---

## What This Demonstrates

- **Legacy-to-modern thinking** — workflow-first UI designed for back-office efficiency
- **RBAC permissions model** — 4 roles, 6 permissions, enforced on both server and client
- **Server-enforced status transitions** — state machine with role-based rules
- **Full audit trail** — every action logged with actor, timestamp, and field-level metadata
- **Task management** — auto-created tasks on status changes, due dates, overdue tracking
- **Form-heavy enterprise UI** — multi-step wizard, field validation, premium dark theme
- **Shared contracts** — Zod schemas in a shared package, zero drift between frontend and backend
- **E2E-ready architecture** — clean separation of concerns, testable at every layer

---

## Architecture

```
┌───────────────────┐     HTTP/JSON     ┌────────────────────┐
│   React SPA       │◄────────────────► │   Express API      │
│   (Vite + MUI)    │   JWT Bearer      │   (TypeScript)     │
│                   │                   │                    │
│  • React Router   │                   │  • Helmet          │
│  • TanStack Query │                   │  • Rate Limiting   │
│  • React Hook Form│                   │  • Zod Validation  │
│  • RBAC guards    │                   │  • RBAC Middleware  │
└───────────────────┘                   │  • Audit Logger    │
                                        │  • Prisma ORM      │
                                        └────────┬───────────┘
                                                 │
                                        ┌────────▼───────────┐
                                        │   PostgreSQL 16    │
                                        │   (Docker)         │
                                        └────────────────────┘
```

### Monorepo Structure

```
claimflow/
├── apps/
│   ├── api/              # Express REST API (TypeScript, Prisma, RBAC, Audit)
│   └── web/              # React SPA (Vite, MUI, TanStack Query, React Router)
├── packages/
│   └── shared/           # Shared Zod schemas, types, RBAC constants
├── docs/
│   ├── architecture.md   # System architecture overview
│   ├── screenshots/      # Application UI screenshots (see Application Preview above)
│   └── adr/              # Architecture Decision Records
│       ├── ADR-001-contracts.md
│       ├── ADR-002-rbac.md
│       └── ADR-003-status-transitions.md
├── docker-compose.yml    # PostgreSQL container
├── .github/workflows/    # CI pipeline
└── README.md
```

---

## Key Flows

### 1. Caseworker: Claim Review
Login → Claims list → Open claim → Read overview → Add note → Create task

### 2. Supervisor: Approve/Reject
Login → Claims list → Filter by status → Open claim → Assign to caseworker → Approve or Reject → Audit log shows full trail

### 3. Read-only: Browse Only
Login → Dashboard → Claims list → Open claim detail → Cannot see action buttons → API returns 403 if forced

---

## RBAC Permission Matrix

| Permission | ADMIN | SUPERVISOR | CASEWORKER | READ_ONLY |
|-----------|:-----:|:----------:|:----------:|:---------:|
| `claims:read` | ✓ | ✓ | ✓ | ✓ |
| `claims:write` | ✓ | ✓ | ✓ | |
| `claims:assign` | ✓ | ✓ | | |
| `claims:transition` | ✓ | ✓ | ✓ | |
| `audit:read` | ✓ | ✓ | ✓ | ✓ |
| `users:manage` | ✓ | | | |

---

## Status Workflow

```
NEW ──► IN_REVIEW ──► APPROVED ──► CLOSED
             │                        ▲
             ├──► NEEDS_INFO ──► IN_REVIEW
             │                        │
             └──► REJECTED ───────────┘
```

- Transitions are **enforced server-side** — invalid transitions return 400
- `APPROVED` / `REJECTED` require **Supervisor or Admin** role
- `NEEDS_INFO` **auto-creates a Task** with a 7-day due date
- Every transition creates an **AuditEvent** with `from → to` metadata

---

## Local Setup

### Requirements
- **Node.js 20+**
- **Docker Desktop** (for PostgreSQL)
- **pnpm** (`npm i -g pnpm`)

### Install & Run

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Run database migration
pnpm db:migrate

# 4. Seed demo data (12 claims, tasks, notes, audit events)
pnpm db:seed

# 5. Start development servers (API + Web)
pnpm dev
```

Open:
- **Web UI**: http://localhost:5173
- **API**: http://localhost:4001
- **Health check**: http://localhost:4001/health

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/login` | No | Login, returns JWT |
| `GET` | `/me` | Yes | Current user info |

### Claims
| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `GET` | `/claims` | `claims:read` | List with search, filter, pagination |
| `POST` | `/claims` | `claims:write` | Create new claim |
| `GET` | `/claims/:id` | `claims:read` | Get claim detail |
| `PATCH` | `/claims/:id` | `claims:write` | Update claim fields |
| `POST` | `/claims/:id/assign` | `claims:assign` | Assign to user |
| `POST` | `/claims/:id/status` | `claims:transition` | Status transition |
| `GET` | `/claims/:id/notes` | `claims:read` | List notes |
| `POST` | `/claims/:id/notes` | `claims:write` | Add note |
| `GET` | `/claims/:id/attachments` | `claims:read` | List attachments |
| `POST` | `/claims/:id/attachments` | `claims:write` | Add attachment metadata |
| `GET` | `/claims/:id/tasks` | `claims:read` | List tasks for claim |

### Tasks
| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `GET` | `/tasks` | `claims:read` | List all tasks (filter: mine, status) |
| `POST` | `/tasks/claims/:claimId` | `claims:write` | Create task |
| `PATCH` | `/tasks/:id` | `claims:write` | Update/close task |

### Dashboard
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/dashboard/stats` | Yes | Aggregated stats for current user |

### Audit
| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `GET` | `/audit` | `audit:read` | Paginated audit log with filters |

### Admin
| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `GET` | `/admin/users` | `users:manage` | List all users |
| `POST` | `/admin/users` | `users:manage` | Create user |
| `PATCH` | `/admin/users/:id` | `users:manage` | Update user role |

---

## Data Model

```
User ──┬── Claim ──┬── ClaimNote
       │           ├── ClaimAttachment
       │           ├── Task
       │           └── AuditEvent
       └── AuditEvent (actor)
```

| Entity | Key Fields |
|--------|-----------|
| **User** | id, email, name, role, password |
| **Claim** | id, claimantName, policyNumber, claimType, icdCode, dateOfService, amountClaimed, description, status, priority, assignedToId |
| **ClaimNote** | id, claimId, authorId, text |
| **Task** | id, claimId, type, title, dueDate, status, assignedToId |
| **ClaimAttachment** | id, claimId, filename, mimeType, size |
| **AuditEvent** | id, claimId, actorId, type, metadata (JSON) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API + Web in parallel |
| `pnpm build` | Build all packages |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed demo data |
| `pnpm -r typecheck` | TypeScript type checking |

---

## Security

| Measure | Implementation |
|---------|----------------|
| Security headers | `helmet` middleware |
| Rate limiting | `express-rate-limit` on auth endpoints |
| Input validation | Zod schemas on every request body |
| Auth | JWT with 2h expiry |
| Password storage | bcrypt (cost factor 10) |
| RBAC | Permission middleware on every protected route |
| Secrets | Environment variables only (`.env.example` provided) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, MUI 6, TanStack Query, React Router 6 |
| **Backend** | Node.js, Express 4, TypeScript, Prisma ORM, Zod, JWT |
| **Database** | PostgreSQL 16 |
| **Tooling** | pnpm workspaces, Docker Compose, GitHub Actions CI |
| **Shared** | `@claimflow/shared` — Zod schemas, types, RBAC constants |

---

## Architecture Decision Records

- [ADR-001: Monorepo with Shared Contracts](docs/adr/ADR-001-contracts.md)
- [ADR-002: RBAC Permission Model](docs/adr/ADR-002-rbac.md)
- [ADR-003: Server-Enforced Status Transitions](docs/adr/ADR-003-status-transitions.md)

---

## Environment Variables

```env
# apps/api/.env
DATABASE_URL=postgresql://claimflow:claimflow@localhost:5432/claimflow?schema=public
JWT_SECRET=dev_change_me
CORS_ORIGIN=http://localhost:5173
PORT=4001

# apps/web/.env (optional, defaults work for local dev)
VITE_API_BASE_URL=http://localhost:4001
```
