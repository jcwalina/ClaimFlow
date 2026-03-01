import type { z } from "zod";
import type {
  ClaimSchema,
  ClaimNoteSchema,
  ClaimAttachmentSchema,
  AuditEventSchema,
  UserPublicSchema,
  TaskSchema,
} from "./schemas";

export type Claim = z.infer<typeof ClaimSchema>;
export type ClaimNote = z.infer<typeof ClaimNoteSchema>;
export type ClaimAttachment = z.infer<typeof ClaimAttachmentSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
export type Task = z.infer<typeof TaskSchema>;