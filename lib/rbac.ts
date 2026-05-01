import { UserRole } from "@prisma/client";

export const permissions = [
  "content.view",
  "content.edit",
  "leads.view",
  "leads.edit",
  "leads.delete",
  "artisans.view",
  "artisans.edit",
  "artisans.delete",
  "assignments.view",
  "assignments.edit",
  "settings.view",
  "settings.edit",
  "settings.backup",
  "settings.clearLogs",
  "users.view",
  "users.create",
  "users.edit",
  "users.resetPassword",
  "notifications.view",
  "notifications.clear",
  "audit.view",
  "audit.export",
  "audit.clear",
  "catalog.view",
  "catalog.edit",
  "pages.view",
  "pages.edit",
] as const;

export type Permission = (typeof permissions)[number];

export const defaultRolePermissions: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [...permissions],
  ADMIN: [
    "content.view",
    "content.edit",
    "leads.view",
    "leads.edit",
    "artisans.view",
    "artisans.edit",
    "assignments.view",
    "assignments.edit",
    "settings.view",
    "settings.edit",
    "notifications.view",
    "audit.view",
    "audit.export",
    "catalog.view",
    "catalog.edit",
    "pages.view",
    "pages.edit",
  ],
  DISPATCHER: [
    "leads.view",
    "leads.edit",
    "artisans.view",
    "artisans.edit",
    "assignments.view",
    "assignments.edit",
  ],
  EDITOR: ["content.view", "content.edit", "pages.view", "pages.edit"],
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
