export const AUDIT_EVENT_LABELS: Record<string, string> = {
  CLAIM_CREATED: "Claim created",
  CLAIM_UPDATED: "Claim updated",
  STATUS_CHANGED: "Status changed",
  ASSIGNED: "Claim assigned",
  NOTE_ADDED: "Note added",
  TASK_CREATED: "Task created",
  TASK_CLOSED: "Task closed",
  USER_CREATED: "User created",
  USER_UPDATED: "User updated",
};

export const AUDIT_EVENT_TYPES = Object.keys(AUDIT_EVENT_LABELS);

export const CLAIM_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  DENTAL: "Dental",
  HOSPITAL: "Hospital",
  PRESCRIPTION: "Prescription",
  THERAPY: "Therapy",
  REHABILITATION: "Rehabilitation",
};

export const TASK_TYPE_LABELS: Record<string, string> = {
  REQUEST_INFO: "Request Info",
  REVIEW: "Review",
  FOLLOW_UP: "Follow Up",
  DOCUMENT_REQUIRED: "Document Required",
};

export const BCRYPT_ROUNDS = 10;
export const NEEDS_INFO_DUE_DAYS = 7;
export const JWT_EXPIRY_SECONDS = 7200;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
export const STORAGE_TOKEN_KEY = "claimflow_token";

export function formatAuditDetail(type: string, metadata: Record<string, unknown>): string {
  if (type === "STATUS_CHANGED" && metadata.from && metadata.to) {
    return `${metadata.from} → ${metadata.to}`;
  }
  if (type === "ASSIGNED" && metadata.assignedToId) {
    return `→ ${metadata.assignedToId}`;
  }
  return "";
}
