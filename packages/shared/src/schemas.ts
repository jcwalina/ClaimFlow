import { z } from "zod";
import { Roles } from "./roles";

export const ClaimStatus = z.enum(["NEW", "IN_REVIEW", "NEEDS_INFO", "APPROVED", "REJECTED", "CLOSED"]);
export type ClaimStatusType = z.infer<typeof ClaimStatus>;

export const Priority = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type PriorityType = z.infer<typeof Priority>;

export const ClaimType = z.enum(["GENERAL", "DENTAL", "HOSPITAL", "PRESCRIPTION", "THERAPY", "REHABILITATION"]);
export type ClaimTypeType = z.infer<typeof ClaimType>;

export const TaskStatus = z.enum(["OPEN", "CLOSED"]);
export const TaskType = z.enum(["REQUEST_INFO", "REVIEW", "FOLLOW_UP", "DOCUMENT_REQUIRED"]);

export const UserPublicSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(Roles),
});

export const ClaimSchema = z.object({
  id: z.string(),
  claimantName: z.string(),
  policyNumber: z.string(),
  claimType: z.string(),
  icdCode: z.string().nullable(),
  dateOfService: z.string().nullable(),
  amountClaimed: z.number().nullable(),
  description: z.string().nullable(),
  status: ClaimStatus,
  priority: Priority,
  assignedTo: UserPublicSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ClaimNoteSchema = z.object({
  id: z.string(),
  claimId: z.string(),
  author: UserPublicSchema,
  text: z.string().min(1),
  createdAt: z.string(),
});

export const ClaimAttachmentSchema = z.object({
  id: z.string(),
  claimId: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative(),
  createdAt: z.string(),
});

export const CreateAttachmentSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

export const TaskSchema = z.object({
  id: z.string(),
  claimId: z.string(),
  type: z.string(),
  title: z.string(),
  dueDate: z.string().nullable(),
  status: TaskStatus,
  assignedTo: UserPublicSchema.nullable(),
  createdAt: z.string(),
});

export const AuditEventSchema = z.object({
  id: z.string(),
  claimId: z.string().nullable(),
  actor: UserPublicSchema,
  type: z.enum([
    "CLAIM_CREATED", "CLAIM_UPDATED", "STATUS_CHANGED", "ASSIGNED",
    "NOTE_ADDED", "TASK_CREATED", "TASK_CLOSED", "USER_CREATED", "USER_UPDATED",
  ]),
  metadata: z.record(z.any()),
  createdAt: z.string(),
});

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

export const CreateClaimSchema = z.object({
  claimantName: z.string().min(2),
  policyNumber: z.string().min(5),
  claimType: ClaimType.default("GENERAL"),
  icdCode: z.string().optional(),
  dateOfService: z.string().optional(),
  amountClaimed: z.number().nonnegative().optional(),
  description: z.string().max(2000).optional(),
  priority: Priority.default("MEDIUM"),
});

export const UpdateClaimSchema = z.object({
  claimantName: z.string().min(2).optional(),
  policyNumber: z.string().min(5).optional(),
  claimType: ClaimType.optional(),
  icdCode: z.string().nullable().optional(),
  dateOfService: z.string().nullable().optional(),
  amountClaimed: z.number().nonnegative().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  priority: Priority.optional(),
});

export const AddNoteSchema = z.object({
  text: z.string().min(1).max(5000),
});

export const AssignClaimSchema = z.object({
  userId: z.string(),
});

export const TransitionSchema = z.object({
  to: ClaimStatus,
});

export const CreateTaskSchema = z.object({
  type: TaskType,
  title: z.string().min(2).max(500),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const UpdateTaskSchema = z.object({
  status: TaskStatus.optional(),
  title: z.string().min(2).max(500).optional(),
  dueDate: z.string().nullable().optional(),
});

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  NEW: ["IN_REVIEW"],
  IN_REVIEW: ["NEEDS_INFO", "APPROVED", "REJECTED"],
  NEEDS_INFO: ["IN_REVIEW"],
  APPROVED: ["CLOSED"],
  REJECTED: ["CLOSED"],
  CLOSED: [],
};
