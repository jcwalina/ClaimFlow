import { api, toQueryString } from "./http";
import type { Task } from "@claimflow/shared";

export type TaskWithClaim = Task & {
  claim?: { id: string; claimantName: string; policyNumber: string };
};

export type TaskListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: TaskWithClaim[];
};

export async function listTasks(params: { mine?: boolean; status?: string; page?: number; pageSize?: number }) {
  return api<TaskListResponse>(`/tasks?${toQueryString({ ...params, mine: params.mine ? "true" : undefined })}`);
}

export async function listClaimTasks(claimId: string) {
  return api<{ items: Task[] }>(`/claims/${claimId}/tasks`);
}

export async function createTask(claimId: string, body: { type: string; title: string; dueDate?: string; assignedToId?: string }) {
  return api<{ id: string }>(`/tasks/claims/${claimId}`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateTask(id: string, body: Partial<{ status: string; title: string; dueDate: string | null }>) {
  return api<{ ok: true }>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
