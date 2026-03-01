# ADR-001: Monorepo with Shared Contracts

## Status
Accepted

## Context
Frontend and backend need to agree on request/response shapes, validation rules, status enums, and role definitions. In a polyrepo setup, these contracts tend to drift — a field renamed in the API breaks the UI silently.

## Decision
Use a **pnpm workspace monorepo** with a `packages/shared` package containing:
- Zod schemas for all request/response payloads
- TypeScript types inferred from those schemas
- Role and permission constants
- Status transition rules

Both `apps/api` and `apps/web` import from `@claimflow/shared` via workspace protocol.

## Consequences
**Positive:**
- Single source of truth for data contracts
- Type errors caught at compile time across the full stack
- Zod schemas serve double duty: runtime validation (API) + type inference (both)
- Refactoring a field name immediately flags all consumers

**Negative:**
- Slightly more complex project setup (workspace config, shared tsconfig)
- CI must build shared package before dependents
- Not suitable if teams need independent deploy cadences (not relevant here)

## Alternatives Considered
- **OpenAPI spec + codegen**: Higher ceremony, good for multi-team; overkill for this project
- **Copy-paste types**: Fast initially, guaranteed drift over time
- **tRPC**: Excellent DX but ties frontend tightly to the API framework
