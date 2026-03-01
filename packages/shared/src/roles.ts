export const Roles = ["ADMIN", "SUPERVISOR", "CASEWORKER", "READ_ONLY"] as const;
export type Role = typeof Roles[number];

export const Permissions = [
  "claims:read",
  "claims:write",
  "claims:assign",
  "claims:transition",
  "audit:read",
  "users:manage",
] as const;
export type Permission = typeof Permissions[number];

export const RolePermissions: Record<Role, Set<Permission>> = {
  ADMIN: new Set(Permissions),
  SUPERVISOR: new Set(["claims:read","claims:write","claims:assign","claims:transition","audit:read"]),
  CASEWORKER: new Set(["claims:read","claims:write","claims:transition","audit:read"]),
  READ_ONLY: new Set(["claims:read","audit:read"]),
};

export function hasPermission(role: Role, perm: Permission): boolean {
  return RolePermissions[role].has(perm);
}
