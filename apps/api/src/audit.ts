import { prisma } from "./prisma.js";
import type { Prisma } from "@prisma/client";

export async function audit(params: {
  actorId: string;
  claimId?: string | null;
  type: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditEvent.create({
    data: {
      actorId: params.actorId,
      claimId: params.claimId ?? null,
      type: params.type,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}
