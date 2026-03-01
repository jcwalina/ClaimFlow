import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { validateBody } from "../validation.js";
import { LoginBodySchema } from "@claimflow/shared";
import { signAccessToken } from "../auth/jwt.js";
import { asyncHandler, toUserPublic } from "../utils.js";
import rateLimit from "express-rate-limit";

export const authRouter = Router();

authRouter.post(
  "/login",
  rateLimit({ windowMs: 60_000, max: 20 }),
  validateBody(LoginBodySchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "InvalidCredentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "InvalidCredentials" });

    const token = signAccessToken({ sub: user.id, role: user.role, email: user.email, name: user.name });
    return res.json({ accessToken: token, user: toUserPublic(user) });
  })
);
