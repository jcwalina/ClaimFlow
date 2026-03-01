import { api, setToken, clearToken } from "./http";
import type { UserPublic } from "@claimflow/shared";

export async function login(email: string, password: string) {
  const data = await api<{ accessToken: string; user: UserPublic }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.accessToken);
  return data.user;
}

export async function me() {
  return api<{ user: { id: string; role: string; email: string; name: string } }>("/me");
}

export function logout() {
  clearToken();
}
