import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, requirePermission } from "../auth/middleware.js";
import { validateBody } from "../validation.js";
import {
  AddNoteSchema, AssignClaimSchema, CreateAttachmentSchema,
  CreateClaimSchema, TransitionSchema, UpdateClaimSchema,
  ALLOWED_TRANSITIONS, MAX_PAGE_SIZE, NEEDS_INFO_DUE_DAYS,
} from "@claimflow/shared";
import type { z } from "zod";
import { audit } from "../audit.js";
import { asyncHandler, toUserPublic } from "../utils.js";

export const claimsRouter = Router();
claimsRouter.use(requireAuth);
claimsRouter.use(requirePermission("claims:read"));

const userSelect = { id: true, email: true, name: true, role: true } as const;

function formatClaim(c: {
  id: string; claimantName: string; policyNumber: string; claimType: string;
  icdCode: string | null; dateOfService: Date | null; amountClaimed: number | null;
  description: string | null; status: string; priority: string;
  assignedTo: { id: string; email: string; name: string; role: string } | null;
  createdAt: Date; updatedAt: Date;
}) {
  return {
    id: c.id,
    claimantName: c.claimantName,
    policyNumber: c.policyNumber,
    claimType: c.claimType,
    icdCode: c.icdCode,
    dateOfService: c.dateOfService?.toISOString() ?? null,
    amountClaimed: c.amountClaimed,
    description: c.description,
    status: c.status,
    priority: c.priority,
    assignedTo: c.assignedTo ? toUserPublic(c.assignedTo) : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

async function findClaimOrFail(id: string) {
  const claim = await prisma.claim.findUnique({ where: { id }, include: { assignedTo: true } });
  return claim;
}

// ── List ──

claimsRouter.get("/", asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(5, Number(req.query.pageSize ?? 10)));
  const search = String(req.query.search ?? "").trim() || undefined;
  const status = String(req.query.status ?? "").trim() || undefined;
  const priority = String(req.query.priority ?? "").trim() || undefined;
  const assignedTo = String(req.query.assignedTo ?? "").trim() || undefined;
  const sort = String(req.query.sort ?? "updatedAt_desc");

  const where = {
    ...(search && {
      OR: [
        { claimantName: { contains: search, mode: "insensitive" as const } },
        { policyNumber: { contains: search, mode: "insensitive" as const } },
        { id: { contains: search } },
      ],
    }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assignedTo && { assignedToId: assignedTo }),
  };

  const orderByMap: Record<string, Record<string, "asc" | "desc">> = {
    createdAt_asc: { createdAt: "asc" },
    createdAt_desc: { createdAt: "desc" },
    updatedAt_asc: { updatedAt: "asc" },
    priority_desc: { priority: "desc" },
  };
  const orderBy = orderByMap[sort] ?? { updatedAt: "desc" };

  const [total, claims] = await Promise.all([
    prisma.claim.count({ where }),
    prisma.claim.findMany({
      where, orderBy,
      include: { assignedTo: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({ page, pageSize, total, items: claims.map(formatClaim) });
}));

// ── Create ──

claimsRouter.post("/", requirePermission("claims:write"), validateBody(CreateClaimSchema), asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof CreateClaimSchema>;
  const claim = await prisma.claim.create({
    data: {
      claimantName: body.claimantName,
      policyNumber: body.policyNumber,
      claimType: body.claimType ?? "GENERAL",
      icdCode: body.icdCode ?? null,
      dateOfService: body.dateOfService ? new Date(body.dateOfService) : null,
      amountClaimed: body.amountClaimed ?? null,
      description: body.description ?? null,
      priority: body.priority,
      status: "NEW",
    },
  });
  await audit({ actorId: req.user!.id, claimId: claim.id, type: "CLAIM_CREATED", metadata: { policyNumber: claim.policyNumber, claimType: claim.claimType } });
  return res.status(201).json({ id: claim.id });
}));

// ── Get ──

claimsRouter.get("/:id", asyncHandler(async (req, res) => {
  const claim = await findClaimOrFail(req.params.id);
  if (!claim) return res.status(404).json({ error: "NotFound" });
  return res.json(formatClaim(claim));
}));

// ── Update ──

claimsRouter.patch("/:id", requirePermission("claims:write"), validateBody(UpdateClaimSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.claim.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "NotFound" });

  const body = req.body as z.infer<typeof UpdateClaimSchema>;
  const data: Record<string, unknown> = {};
  if (body.claimantName !== undefined) data.claimantName = body.claimantName;
  if (body.policyNumber !== undefined) data.policyNumber = body.policyNumber;
  if (body.claimType !== undefined) data.claimType = body.claimType;
  if (body.icdCode !== undefined) data.icdCode = body.icdCode;
  if (body.dateOfService !== undefined) data.dateOfService = body.dateOfService ? new Date(body.dateOfService) : null;
  if (body.amountClaimed !== undefined) data.amountClaimed = body.amountClaimed;
  if (body.description !== undefined) data.description = body.description;
  if (body.priority !== undefined) data.priority = body.priority;

  await prisma.claim.update({ where: { id: existing.id }, data });
  await audit({ actorId: req.user!.id, claimId: existing.id, type: "CLAIM_UPDATED", metadata: { fields: Object.keys(data) } });
  return res.json({ ok: true });
}));

// ── Assign ──

claimsRouter.post("/:id/assign", requirePermission("claims:assign"), validateBody(AssignClaimSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.claim.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "NotFound" });

  const { userId } = req.body as z.infer<typeof AssignClaimSchema>;
  await prisma.claim.update({ where: { id: existing.id }, data: { assignedToId: userId } });
  await audit({ actorId: req.user!.id, claimId: existing.id, type: "ASSIGNED", metadata: { assignedToId: userId } });
  return res.json({ ok: true });
}));

// ── Status transition ──

function canTransition(role: string, from: string, to: string): { ok: boolean; reason?: string } {
  if (!ALLOWED_TRANSITIONS[from]?.includes(to)) return { ok: false, reason: "InvalidTransition" };
  if ((to === "APPROVED" || to === "REJECTED") && role !== "SUPERVISOR" && role !== "ADMIN") {
    return { ok: false, reason: "SupervisorOnly" };
  }
  return { ok: true };
}

claimsRouter.post("/:id/status", requirePermission("claims:transition"), validateBody(TransitionSchema), asyncHandler(async (req, res) => {
  const { to } = req.body as z.infer<typeof TransitionSchema>;
  const current = await prisma.claim.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ error: "NotFound" });

  const check = canTransition(req.user!.role, current.status, to);
  if (!check.ok) return res.status(400).json({ error: check.reason });

  await prisma.claim.update({ where: { id: current.id }, data: { status: to } });
  await audit({ actorId: req.user!.id, claimId: current.id, type: "STATUS_CHANGED", metadata: { from: current.status, to } });

  if (to === "NEEDS_INFO") {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + NEEDS_INFO_DUE_DAYS);
    await prisma.task.create({
      data: {
        claimId: current.id,
        type: "REQUEST_INFO",
        title: `Information required for claim ${current.policyNumber}`,
        dueDate,
        assignedToId: current.assignedToId,
      },
    });
    await audit({ actorId: req.user!.id, claimId: current.id, type: "TASK_CREATED", metadata: { auto: true, reason: "NEEDS_INFO transition" } });
  }

  return res.json({ ok: true });
}));

// ── Notes ──

claimsRouter.get("/:id/notes", asyncHandler(async (req, res) => {
  const notes = await prisma.claimNote.findMany({
    where: { claimId: req.params.id },
    include: { author: { select: userSelect } },
    orderBy: { createdAt: "desc" },
  });
  return res.json({
    items: notes.map(n => ({
      id: n.id, claimId: n.claimId, text: n.text,
      createdAt: n.createdAt.toISOString(),
      author: n.author,
    })),
  });
}));

claimsRouter.post("/:id/notes", requirePermission("claims:write"), validateBody(AddNoteSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.claim.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "NotFound" });

  const { text } = req.body as z.infer<typeof AddNoteSchema>;
  const note = await prisma.claimNote.create({ data: { claimId: existing.id, authorId: req.user!.id, text } });
  await audit({ actorId: req.user!.id, claimId: existing.id, type: "NOTE_ADDED", metadata: { noteId: note.id } });
  return res.status(201).json({ id: note.id });
}));

// ── Attachments ──

claimsRouter.get("/:id/attachments", asyncHandler(async (req, res) => {
  const items = await prisma.claimAttachment.findMany({
    where: { claimId: req.params.id },
    orderBy: { createdAt: "desc" },
  });
  return res.json({
    items: items.map(a => ({
      id: a.id, claimId: a.claimId, filename: a.filename,
      mimeType: a.mimeType, size: a.size,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}));

claimsRouter.post("/:id/attachments", requirePermission("claims:write"), validateBody(CreateAttachmentSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.claim.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "NotFound" });

  const { filename, mimeType, size } = req.body as z.infer<typeof CreateAttachmentSchema>;
  const a = await prisma.claimAttachment.create({ data: { claimId: existing.id, filename, mimeType, size } });
  await audit({ actorId: req.user!.id, claimId: existing.id, type: "CLAIM_UPDATED", metadata: { attachmentId: a.id, filename } });
  return res.status(201).json({ id: a.id });
}));

// ── Tasks (scoped to claim) ──

claimsRouter.get("/:id/tasks", asyncHandler(async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { claimId: req.params.id },
    include: { assignedTo: { select: userSelect } },
    orderBy: { createdAt: "desc" },
  });
  return res.json({
    items: tasks.map(t => ({
      id: t.id, claimId: t.claimId, type: t.type, title: t.title,
      dueDate: t.dueDate?.toISOString() ?? null,
      status: t.status, assignedTo: t.assignedTo,
      createdAt: t.createdAt.toISOString(),
    })),
  });
}));
