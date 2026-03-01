# ADR-003: Server-Enforced Status Transitions

## Status
Accepted

## Context
Claim status drives the entire workflow. Invalid transitions (e.g., jumping from `NEW` to `CLOSED`) would corrupt business logic. The frontend shows available actions, but we cannot trust client-side enforcement alone.

## Decision
Implement a **server-side state machine** for claim status transitions:

```
NEW → IN_REVIEW → NEEDS_INFO → IN_REVIEW (loop)
                → APPROVED → CLOSED
                → REJECTED → CLOSED
```

**Rules:**
1. Allowed transitions are defined in a shared constant (`ALLOWED_TRANSITIONS`)
2. The API endpoint `POST /claims/:id/status` checks:
   - Current status allows the requested transition
   - User's role permits the transition (e.g., only SUPERVISOR/ADMIN for APPROVED/REJECTED)
3. Every successful transition creates an `AuditEvent` with `from` and `to` metadata
4. Transitioning to `NEEDS_INFO` auto-creates a `Task` with a 7-day due date

**Frontend behavior:**
- Only renders transition buttons that are valid for the current status
- Disables APPROVED/REJECTED buttons for non-supervisor roles
- On error, shows the server's rejection reason

## Consequences
**Positive:**
- Business rules cannot be bypassed via direct API calls
- Audit trail captures every transition with actor, timestamp, and metadata
- Transition rules are testable in isolation
- Auto-task creation on NEEDS_INFO prevents forgotten follow-ups

**Negative:**
- Adding a new status requires updating the transition map + potentially the frontend
- No undo/rollback (by design — audit trail provides traceability instead)

## Alternatives Considered
- **Client-only validation**: Easy to implement but trivially bypassable
- **Full workflow engine (e.g., Temporal)**: Massive overhead for this use case
- **Database triggers**: Harder to test and debug than application-level rules
