import { api, toQueryString } from "./http";
import type { AuditEvent } from "@claimflow/shared";

export type AuditListResponse = {
  items: AuditEvent[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listAudit(params: {
  claimId?: string;
  actorId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) {
  return api<AuditListResponse>(`/audit?${toQueryString(params)}`);
}
