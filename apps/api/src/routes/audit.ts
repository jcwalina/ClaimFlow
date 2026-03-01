import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, requirePermission } from "../auth/middleware.js";
import { asyncHandler, toUserPublic } from "../utils.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@claimflow/shared";

export const auditRouter = Router();
auditRouter.use(requireAuth);
auditRouter.use(requirePermission("audit:read"));

auditRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(5, Number(req.query.pageSize ?? DEFAULT_PAGE_SIZE)));
    const claimId = String(req.query.claimId ?? "").trim() || undefined;
    const actorId = String(req.query.actorId ?? "").trim() || undefined;
    const type = String(req.query.type ?? "").trim() || undefined;

    const where = { ...(claimId && { claimId }), ...(actorId && { actorId }), ...(type && { type }) };

    const [total, events] = await Promise.all([
      prisma.auditEvent.count({ where }),
      prisma.auditEvent.findMany({
        where,
        include: { actor: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return res.json({
      page,
      pageSize,
      total,
      items: events.map(e => ({
        id: e.id,
        claimId: e.claimId,
        type: e.type,
        metadata: e.metadata,
        createdAt: e.createdAt.toISOString(),
        actor: toUserPublic(e.actor),
      })),
    });
  })
);
