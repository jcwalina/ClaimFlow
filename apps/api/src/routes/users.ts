import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, requirePermission } from "../auth/middleware.js";
import { asyncHandler, toUserPublic } from "../utils.js";

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.get(
  "/",
  requirePermission("claims:assign"),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
    return res.json({ items: users.map(toUserPublic) });
  })
);
