import { api } from "./http";

export type AdminUser = { id: string; email: string; name: string; role: string; createdAt: string };

export async function adminListUsers() {
  return api<{ items: AdminUser[] }>("/admin/users");
}

export async function adminCreateUser(body: { email: string; name: string; role: string; password: string }) {
  return api<{ id: string }>("/admin/users", { method: "POST", body: JSON.stringify(body) });
}

export async function adminUpdateUser(id: string, body: Partial<{ name: string; role: string }>) {
  return api<{ ok: true }>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
