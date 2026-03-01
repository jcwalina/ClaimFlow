import { api, toQueryString } from "./http";
import type { Claim, ClaimNote } from "@claimflow/shared";

export type ClaimListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: Claim[];
};

export async function listClaims(params: {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}) {
  return api<ClaimListResponse>(`/claims?${toQueryString(params)}`);
}

export async function getClaim(id: string) {
  return api<Claim>(`/claims/${id}`);
}

export async function createClaim(body: {
  claimantName: string;
  policyNumber: string;
  claimType?: string;
  icdCode?: string;
  dateOfService?: string;
  amountClaimed?: number;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}) {
  return api<{ id: string }>("/claims", { method: "POST", body: JSON.stringify(body) });
}

export async function updateClaim(
  id: string,
  body: Partial<{
    claimantName: string;
    policyNumber: string;
    claimType: string;
    icdCode: string | null;
    dateOfService: string | null;
    amountClaimed: number | null;
    description: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
  }>
) {
  return api<{ ok: true }>(`/claims/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function assignClaim(id: string, userId: string) {
  return api<{ ok: true }>(`/claims/${id}/assign`, { method: "POST", body: JSON.stringify({ userId }) });
}

export async function transitionClaim(id: string, to: string) {
  return api<{ ok: true }>(`/claims/${id}/status`, { method: "POST", body: JSON.stringify({ to }) });
}

export async function listNotes(id: string) {
  return api<{ items: ClaimNote[] }>(`/claims/${id}/notes`);
}

export async function addNote(id: string, text: string) {
  return api<{ id: string }>(`/claims/${id}/notes`, { method: "POST", body: JSON.stringify({ text }) });
}

export type Attachment = {
  id: string;
  claimId: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export async function listAttachments(id: string) {
  return api<{ items: Attachment[] }>(`/claims/${id}/attachments`);
}

export async function addAttachmentMeta(id: string, body: { filename: string; mimeType: string; size: number }) {
  return api<{ id: string }>(`/claims/${id}/attachments`, { method: "POST", body: JSON.stringify(body) });
}
