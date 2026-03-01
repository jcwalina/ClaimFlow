import { ZodError, type ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "ValidationError", details: formatZod(parsed.error) });
    req.body = parsed.data as any;
    next();
  };
}

function formatZod(err: ZodError) {
  return err.issues.map(i => ({ path: i.path.join("."), message: i.message }));
}
