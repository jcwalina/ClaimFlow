import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, (_req, res) => {
  return res.json({ user: _req.user });
});
