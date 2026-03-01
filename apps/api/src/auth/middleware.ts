import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt.js";
import { hasPermission, type Permission, type Role } from "@claimflow/shared";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role; email: string; name: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const token = header.slice("Bearer ".length);
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role as Role, email: payload.email, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requirePermission(perm: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: "Unauthorized" });
    if (!hasPermission(role, perm)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
