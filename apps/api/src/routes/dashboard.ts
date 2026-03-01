import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../auth/middleware.js";
import { asyncHandler, toUserPublic } from "../utils.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/stats", asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const now = new Date();

  const [myClaims, overdueTasks, newClaims, inReview, needsInfo, totalClaims, openTasks, recentActivity] =
    await Promise.all([
      prisma.claim.count({ where: { assignedToId: userId } }),
      prisma.task.count({ where: { status: "OPEN", dueDate: { lt: now } } }),
      prisma.claim.count({ where: { status: "NEW" } }),
      prisma.claim.count({ where: { status: "IN_REVIEW" } }),
      prisma.claim.count({ where: { status: "NEEDS_INFO" } }),
      prisma.claim.count(),
      prisma.task.count({ where: { status: "OPEN" } }),
      prisma.auditEvent.findMany({
        include: { actor: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  return res.json({
    myClaims, overdueTasks, newClaims, inReview, needsInfo, totalClaims, openTasks,
    recentActivity: recentActivity.map(e => ({
      id: e.id, type: e.type, claimId: e.claimId,
      actor: { id: e.actor.id, name: e.actor.name, role: e.actor.role },
      metadata: e.metadata,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}));
