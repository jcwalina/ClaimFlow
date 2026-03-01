# ADR-002: Role-Based Access Control Model

## Status
Accepted

## Context
Health insurance back-office systems require strict access control. Different roles (admin, supervisor, caseworker, auditor) need different capabilities. We need a model that is:
- Easy to reason about
- Enforceable on both server and client
- Extensible without rewriting middleware

## Decision
Implement a **static RBAC model** with:

**4 Roles:**
| Role | Description |
|------|-------------|
| `ADMIN` | Full system access, user management |
| `SUPERVISOR` | Assign claims, approve/reject, view audit |
| `CASEWORKER` | Read/write claims, add notes, manage tasks |
| `READ_ONLY` | Browse claims and audit log |

**6 Permissions:**
| Permission | ADMIN | SUPERVISOR | CASEWORKER | READ_ONLY |
|-----------|-------|-----------|------------|-----------|
| `claims:read` | ✓ | ✓ | ✓ | ✓ |
| `claims:write` | ✓ | ✓ | ✓ | |
| `claims:assign` | ✓ | ✓ | | |
| `claims:transition` | ✓ | ✓ | ✓ | |
| `audit:read` | ✓ | ✓ | ✓ | ✓ |
| `users:manage` | ✓ | | | |

The matrix is defined in `packages/shared/src/roles.ts` and used by:
- **API middleware** (`requirePermission`) to guard routes
- **Frontend** (`hasPermission`) to conditionally render action buttons

## Consequences
**Positive:**
- Permission checks are consistent across frontend and backend
- Adding a new permission requires updating one file
- The matrix is visible and testable as a unit

**Negative:**
- Static model — no per-user custom permissions (acceptable for this domain)
- Role stored as string in JWT; changing a user's role requires re-authentication

## Alternatives Considered
- **ABAC (Attribute-Based)**: More flexible but significantly more complex
- **Per-resource ACLs**: Overkill unless claims have individual access restrictions
- **OAuth2 scopes**: Better for API-to-API; RBAC is more natural for back-office users
