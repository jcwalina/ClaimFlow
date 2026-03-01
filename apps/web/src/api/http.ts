import { env } from "../env";
import { STORAGE_TOKEN_KEY } from "@claimflow/shared";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(env.apiBaseUrl + path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body?.error ?? "RequestFailed", res.status, body);
  }
  return res.json() as Promise<T>;
}

export function toQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  return qs.toString();
}
