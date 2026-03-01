import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { requireAuth, requirePermission } from "../auth/middleware.js";
import { audit } from "../audit.js";
import { Roles, BCRYPT_ROUNDS } from "@claimflow/shared";
import { z } from "zod";
import { validateBody } from "../validation.js";
import { asyncHandler, toUserPublic } from "../utils.js";

export const adminRouter = Router();
adminRouter.use(requireAuth);
adminRouter.use(requirePermission("users:manage"));

adminRouter.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return res.json({
      items: users.map(u => ({ ...toUserPublic(u), createdAt: u.createdAt.toISOString() })),
    });
  })
);

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(Roles),
  password: z.string().min(6),
});

adminRouter.post(
  "/users",
  validateBody(CreateUserSchema),
  asyncHandler(async (req, res) => {
    const { email, name, role, password } = req.body as z.infer<typeof CreateUserSchema>;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "EmailAlreadyExists" });

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({ data: { email, name, role, password: hash } });
    await audit({ actorId: req.user!.id, type: "USER_CREATED", metadata: { userId: user.id, email, role } });
    return res.status(201).json({ id: user.id });
  })
);

const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(Roles).optional(),
});

adminRouter.patch(
  "/users/:id",
  validateBody(UpdateUserSchema),
  asyncHandler(async (req, res) => {
    const { name, role } = req.body as z.infer<typeof UpdateUserSchema>;
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "NotFound" });

    const data: Record<string, string> = {};
    if (name !== undefined) data.name = name;
    if (role !== undefined) data.role = role;

    await prisma.user.update({ where: { id: req.params.id }, data });
    await audit({ actorId: req.user!.id, type: "USER_UPDATED", metadata: { userId: target.id, fields: Object.keys(data) } });
    return res.json({ ok: true });
  })
);
