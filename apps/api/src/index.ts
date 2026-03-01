import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { claimsRouter } from "./routes/claims.js";
import { auditRouter } from "./routes/audit.js";
import { meRouter } from "./routes/me.js";
import { usersRouter } from "./routes/users.js";
import { adminRouter } from "./routes/admin.js";
import { tasksRouter } from "./routes/tasks.js";
import { dashboardRouter } from "./routes/dashboard.js";

const app = express();
app.use(pinoHttp({ quietReqLogger: true }));
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/claims", claimsRouter);
app.use("/audit", auditRouter);
app.use("/tasks", tasksRouter);
app.use("/dashboard", dashboardRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);

app.use((_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = config.isProduction ? "InternalServerError" : (_err instanceof Error ? _err.message : "InternalServerError");
  console.error(_err);
  res.status(500).json({ error: message });
});

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
