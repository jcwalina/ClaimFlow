# ClaimFlow — Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite + TypeScript)                         │  │
│  │  ┌──────────┐ ┌───────────┐ ┌───────────────────────┐ │  │
│  │  │ MUI      │ │ React     │ │ TanStack Query        │ │  │
│  │  │ Premium  │ │ Router    │ │ (server-state cache)  │ │  │
│  │  │ Theme    │ │ (routes)  │ │                       │ │  │
│  │  └──────────┘ └───────────┘ └───────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │ HTTP (JWT Bearer)                  │
└──────────────────────────┼──────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   Express API (Node.js + TS)                  │
│  ┌──────────┐ ┌───────────┐ ┌────────┐ ┌──────────────────┐ │
│  │ Helmet   │ │ Rate      │ │ JWT    │ │ RBAC Middleware   │ │
│  │ (headers)│ │ Limiter   │ │ Auth   │ │ (permissions)    │ │
│  └──────────┘ └───────────┘ └────────┘ └──────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Route Handlers (Zod-validated requests)                  ││
│  │  /auth  /claims  /tasks  /audit  /dashboard  /admin      ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Prisma ORM (type-safe database access)                   ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    PostgreSQL 16                               │
│  Users · Claims · Tasks · Notes · Attachments · AuditEvents   │
└──────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
claimflow/
├── apps/
│   ├── api/          # Express REST API
│   └── web/          # React SPA (Vite)
├── packages/
│   └── shared/       # Zod schemas, types, RBAC constants
├── docs/             # Architecture docs + ADRs
├── docker-compose.yml
└── .github/workflows/ci.yml
```

The `packages/shared` package is the single source of truth for:
- Request/response schemas (Zod)
- TypeScript types (inferred from Zod)
- Role definitions and permission matrix
- Status transition rules

Both `apps/api` and `apps/web` depend on `@claimflow/shared`, ensuring zero drift between frontend and backend contracts.

## Data Flow

1. **Authentication**: User logs in → API validates credentials → returns JWT
2. **Authorization**: Every API request passes through `requireAuth` + `requirePermission` middleware
3. **Validation**: Request bodies are parsed through Zod schemas before hitting handlers
4. **Audit**: Every state-changing action creates an `AuditEvent` record
5. **Caching**: TanStack Query manages server-state caching on the frontend with configurable stale times

## Key Design Decisions

See ADR documents in `docs/adr/` for rationale on:
- ADR-001: Monorepo with shared contracts
- ADR-002: RBAC permission model
- ADR-003: Server-enforced status transitions

## Status Machine

```
NEW ──────► IN_REVIEW ──────► APPROVED ──────► CLOSED
                │                                  ▲
                ├──────► NEEDS_INFO ───► IN_REVIEW │
                │                                  │
                └──────► REJECTED ─────────────────┘
```

Transition rules:
- Any authorized user can move `NEW → IN_REVIEW`
- Only `SUPERVISOR` or `ADMIN` can set `APPROVED` or `REJECTED`
- `NEEDS_INFO` auto-creates a Task with a 7-day due date
- Every transition logs an audit event with `from` and `to` metadata

## Security Layers

| Layer | Implementation |
|-------|----------------|
| Transport | HTTPS (deployment) |
| Headers | Helmet (CSP, HSTS, etc.) |
| Rate limiting | express-rate-limit on auth endpoints |
| Authentication | JWT (access token, 2h expiry) |
| Authorization | RBAC middleware checking role → permission matrix |
| Input validation | Zod schemas on every request body |
| Password storage | bcrypt (cost factor 10) |
| Secrets | Environment variables only (.env, never committed) |
