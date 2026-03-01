import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, requirePermission } from "../auth/middleware.js";
import { validateBody } from "../validation.js";
import { CreateTaskSchema, UpdateTaskSchema, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from "@claimflow/shared";
import type { z } from "zod";
import { audit } from "../audit.js";
import { asyncHandler, toUserPublic } from "../utils.js";

export const tasksRouter = Router();
tasksRouter.use(requireAuth);
tasksRouter.use(requirePermission("claims:read"));

const userSelect = { id: true, email: true, name: true, role: true } as const;
const claimSelect = { id: true, claimantName: true, policyNumber: true } as const;

tasksRouter.get("/", asyncHandler(async (req, res) => {
  const mine = req.query.mine === "true";
  const status = String(req.query.status ?? "").trim() || undefined;
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(5, Number(req.query.pageSize ?? DEFAULT_PAGE_SIZE)));

  const where = {
    ...(mine && { assignedToId: req.user!.id }),
    ...(status && { status }),
  };

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      include: { assignedTo: { select: userSelect }, claim: { select: claimSelect } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    page, pageSize, total,
    items: tasks.map(t => ({
      id: t.id, claimId: t.claimId, claim: t.claim,
      type: t.type, title: t.title,
      dueDate: t.dueDate?.toISOString() ?? null,
      status: t.status,
      assignedTo: t.assignedTo ? toUserPublic(t.assignedTo) : null,
      createdAt: t.createdAt.toISOString(),
    })),
  });
}));

tasksRouter.post(
  "/claims/:claimId",
  requirePermission("claims:write"),
  validateBody(CreateTaskSchema),
  asyncHandler(async (req, res) => {
    const claim = await prisma.claim.findUnique({ where: { id: req.params.claimId } });
    if (!claim) return res.status(404).json({ error: "NotFound" });

    const { type, title, dueDate, assignedToId } = req.body as z.infer<typeof CreateTaskSchema>;
    const task = await prisma.task.create({
      data: {
        claimId: claim.id, type, title,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId ?? null,
      },
    });
    await audit({ actorId: req.user!.id, claimId: claim.id, type: "TASK_CREATED", metadata: { taskId: task.id, taskType: type, title } });
    return res.status(201).json({ id: task.id });
  })
);

tasksRouter.patch(
  "/:id",
  requirePermission("claims:write"),
  validateBody(UpdateTaskSchema),
  asyncHandler(async (req, res) => {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NotFound" });

    const body = req.body as z.infer<typeof UpdateTaskSchema>;
    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.title !== undefined) data.title = body.title;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;

    await prisma.task.update({ where: { id: existing.id }, data });

    if (body.status === "CLOSED") {
      await audit({ actorId: req.user!.id, claimId: existing.claimId, type: "TASK_CLOSED", metadata: { taskId: existing.id } });
    }
    return res.json({ ok: true });
  })
);
