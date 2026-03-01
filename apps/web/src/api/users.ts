import { api } from "./http";
import type { UserPublic } from "@claimflow/shared";

export async function listUsers() {
  return api<{ items: UserPublic[] }>("/users");
}
