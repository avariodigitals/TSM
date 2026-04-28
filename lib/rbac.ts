import { UserRole } from "@prisma/client";

export const permissions = [
  "content.manage",
  "leads.manage",
  "artisans.manage",
  "assignments.manage",
  "settings.manage",
  "users.manage",
  "notifications.manage",
  "catalog.manage",
] as const;

export type Permission = (typeof permissions)[number];

export const defaultRolePermissions: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [...permissions],
  ADMIN: [
    "content.manage",
    "leads.manage",
    "artisans.manage",
    "assignments.manage",
    "settings.manage",
    "notifications.manage",
    "catalog.manage",
  ],
  DISPATCHER: ["leads.manage", "artisans.manage", "assignments.manage"],
  EDITOR: ["content.manage"],
  VIEWER: [],
};

export function hasPermission(
  role: UserRole,
  permission: Permission,
  permissionOverrides?: unknown,
  rolePermissionsMap: Record<UserRole, Permission[]> = defaultRolePermissions
): boolean {
  if (rolePermissionsMap[role].includes(permission)) {
    return true;
  }

  if (Array.isArray(permissionOverrides)) {
    return permissionOverrides.includes(permission);
  }

  return false;
}

export function getRolePermissions(role: UserRole): Permission[] {
  return defaultRolePermissions[role];
}
