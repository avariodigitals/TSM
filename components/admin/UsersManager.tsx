"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { permissions, type Permission } from "@/lib/rbac";
import {
  AdminTableControls,
  AdminToast,
  getErrorMessage,
  useAdminToast,
} from "@/components/admin/AdminClientHelpers";

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  permissionOverrides: string[] | null;
  createdAt: string;
};

const roles = Object.values(UserRole);
const pageSize = 10;

export default function UsersManager({
  users,
  rolePermissions,
}: {
  users: UserRow[];
  rolePermissions: Record<UserRole, Permission[]>;
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [roleDraft, setRoleDraft] = useState<Record<UserRole, Permission[]>>(rolePermissions);
  const [isSavingRoles, setIsSavingRoles] = useState(false);
  const { toast, showToast } = useAdminToast();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery = [user.fullName, user.email, ...(user.permissionOverrides ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsCreating(true);

    const form = new FormData(event.currentTarget);

    const role = String(form.get("role") || UserRole.VIEWER) as UserRole;

    if (!window.confirm(`Create a new ${role} admin user?`)) {
      setIsCreating(false);
      return;
    }

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: String(form.get("fullName") || ""),
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
        role,
      }),
    });

    setIsCreating(false);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to create user."));
      showToast("User creation failed.", "error");
      return;
    }

    event.currentTarget.reset();
    showToast("Admin user created successfully.");
    router.refresh();
  }

  async function updateUser(payload: {
    userId: string;
    role: UserRole;
    isActive: boolean;
    permissionOverrides: string[];
  }) {
    setError("");
    setPendingId(payload.userId);

    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPendingId(null);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to update user."));
      showToast("User update failed.", "error");
      return;
    }

    showToast("Admin user updated successfully.");
    router.refresh();
  }

  async function saveRolePermissions() {
    setError("");
    setIsSavingRoles(true);

    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "rbac.rolePermissions",
        value: roleDraft,
        description: "Role-level permission visibility/control matrix",
      }),
    });

    setIsSavingRoles(false);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to save role permissions."));
      showToast("Role permission update failed.", "error");
      return;
    }

    showToast("Role permissions saved successfully.");
    router.refresh();
  }

  function toggleRolePermission(role: UserRole, permission: Permission, checked: boolean) {
    setRoleDraft((current) => {
      const currentPermissions = current[role] ?? [];
      if (checked) {
        return {
          ...current,
          [role]: Array.from(new Set([...currentPermissions, permission])),
        };
      }

      return {
        ...current,
        [role]: currentPermissions.filter((item) => item !== permission),
      };
    });
  }

  return (
    <div className="space-y-5">
      <AdminToast toast={toast} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h1 className="text-2xl font-black text-[#231F20] mb-2">Role Permissions</h1>
        <p className="text-sm text-gray-500 mb-4">Control what each role can see and manage across backend sections.</p>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F7FA] text-left">
                <th className="p-3">Permission</th>
                {roles.map((role) => (
                  <th key={role} className="p-3">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={permission} className="border-t border-gray-100">
                  <td className="p-3 font-semibold">{permission}</td>
                  {roles.map((role) => (
                    <td key={`${role}-${permission}`} className="p-3">
                      <input
                        type="checkbox"
                        checked={(roleDraft[role] ?? []).includes(permission)}
                        onChange={(event) => toggleRolePermission(role, permission, event.target.checked)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() => void saveRolePermissions()}
          disabled={isSavingRoles}
          className="mt-4 rounded-lg bg-[#2E3192] px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {isSavingRoles ? "Saving..." : "Save Role Permissions"}
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h1 className="text-2xl font-black text-[#231F20] mb-4">Admin Users & Privileges</h1>
        <form onSubmit={createUser} className="grid md:grid-cols-4 gap-3 items-end">
          <input name="fullName" required placeholder="Full name" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="email" required type="email" placeholder="Email" className="rounded-md border border-gray-300 px-3 py-2" />
          <input
            name="password"
            required
            type="password"
            minLength={8}
            placeholder="Password"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <select name="role" className="rounded-md border border-gray-300 px-3 py-2">
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button type="submit" disabled={isCreating} className="rounded-lg bg-[#00AEEF] text-white px-4 py-2 font-semibold w-fit">
            {isCreating ? "Creating..." : "Create User"}
          </button>
        </form>
        {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <AdminTableControls
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            queryPlaceholder="Search by name, email, or permission override"
            totalCount={filteredUsers.length}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(nextPage) => setPage(Math.max(1, Math.min(nextPage, totalPages)))}
            filterLabel="Role"
            filterValue={roleFilter}
            onFilterChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
            filterOptions={[{ label: "All roles", value: "ALL" }, ...roles.map((role) => ({ label: role, value: role }))]}
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F7FA] text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Active</th>
                <th className="p-3">Overrides</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-sm text-gray-500" colSpan={6}>
                    No users matched the current search or filter.
                  </td>
                </tr>
              ) : null}
              {paginatedUsers.map((user) => {
                const isPending = pendingId === user.id;
                return (
                  <tr key={user.id} className="border-t border-gray-100 align-top">
                    <td className="p-3">{user.fullName}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <select id={`role-${user.id}`} defaultValue={user.role} className="rounded-md border border-gray-300 px-2 py-1">
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input id={`active-${user.id}`} type="checkbox" defaultChecked={user.isActive} />
                    </td>
                    <td className="p-3">
                      <input
                        id={`overrides-${user.id}`}
                        defaultValue={(user.permissionOverrides ?? []).join(",")}
                        className="rounded-md border border-gray-300 px-2 py-1 w-64"
                        placeholder="comma,separated,permissions"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        disabled={isPending}
                        className="rounded-lg bg-[#00AEEF] text-white px-3 py-2 font-semibold disabled:opacity-50"
                        onClick={() => {
                          const roleElement = document.getElementById(`role-${user.id}`) as HTMLSelectElement | null;
                          const activeElement = document.getElementById(`active-${user.id}`) as HTMLInputElement | null;
                          const overridesElement = document.getElementById(`overrides-${user.id}`) as
                            | HTMLInputElement
                            | null;
                          if (!roleElement || !activeElement || !overridesElement) return;

                          const overrides = overridesElement.value
                            .split(",")
                            .map((value) => value.trim())
                            .filter(Boolean);

                          const nextRole = roleElement.value as UserRole;
                          const nextActive = activeElement.checked;

                          if (
                            ((user.role !== nextRole &&
                              !window.confirm(`Confirm role change from ${user.role} to ${nextRole}?`)) ||
                              (user.isActive !== nextActive &&
                                !window.confirm(
                                  nextActive
                                    ? "Reactivate this admin user?"
                                    : "Deactivate this admin user and revoke access?"
                                )))
                          ) {
                            return;
                          }

                          void updateUser({
                            userId: user.id,
                            role: nextRole,
                            isActive: nextActive,
                            permissionOverrides: overrides,
                          });
                        }}
                      >
                        {isPending ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
