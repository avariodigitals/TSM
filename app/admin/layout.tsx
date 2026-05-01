import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getEffectivePermissionsForUser } from "@/lib/admin-auth";
import { checkDatabaseHealth, isDatabaseConnectivityError } from "@/lib/db-health";
import type { Permission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊", permission: null },
  { href: "/admin/leads", label: "Enquiries / Leads", icon: "📥", permission: "leads.view" },
  { href: "/admin/artisans", label: "Artisan Registrations", icon: "🧰", permission: "artisans.view" },
  { href: "/admin/assignments", label: "Artisan Placements", icon: "📌", permission: "assignments.view" },
  { href: "/admin/site-content", label: "Pages", icon: "🗂️", permission: "content.view" },
  { href: "/admin/catalog", label: "Services & Cities", icon: "🧭", permission: "catalog.view" },
  { href: "/admin/content", label: "Content", icon: "📝", permission: "content.view" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️", permission: "settings.view" },
  { href: "/admin/notifications", label: "Notifications", icon: "🔔", permission: "notifications.view" },
  { href: "/admin/users", label: "Admin Users", icon: "👤", permission: "users.view" },
  { href: "/admin/audit-logs", label: "Audit Trail", icon: "📚", permission: "audit.view" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const dbHealth = await checkDatabaseHealth();

  if (!session?.user) {
    redirect("/auth/admin-login");
  }

  let user: { role: UserRole; permissionOverrides: unknown; isActive: boolean; email: string } | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { email: session.user.email ?? "" },
      select: { role: true, permissionOverrides: true, isActive: true, email: true },
    });
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      return (
        <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h1 className="text-2xl font-black text-[#231F20] mb-2">Admin Temporarily Unavailable</h1>
            <p className="text-sm text-gray-600">
              We could not reach the database service for admin authentication. Please retry in a moment.
            </p>
          </div>
        </div>
      );
    }

    throw error;
  }

  if (!user || !user.isActive) {
    redirect("/auth/admin-login");
  }

  let effectivePermissions: Permission[] = [];
  try {
    effectivePermissions = await getEffectivePermissionsForUser(user);
  } catch {
    effectivePermissions = [];
  }
  const visibleLinks = links.filter((link) => !link.permission || effectivePermissions.includes(link.permission as Permission));

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="min-h-screen bg-gradient-to-b from-[#2E3192] to-[#1a1d6b] text-white">
          <div className="px-5 py-6 border-b border-white/10 bg-white/5">
            <h2 className="text-2xl font-black tracking-tight">
              Total Serve <span className="text-[#00AEEF]">Admin</span>
            </h2>
            <p className="mt-2 text-xs uppercase tracking-wide text-[#cdd8ff]">Signed in as</p>
            <p className="text-sm font-semibold break-all">{session.user.email}</p>
          </div>

          <nav className="px-3 py-4 space-y-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#e5e9ff] hover:bg-white/15 transition-colors"
              >
                <span className="text-base leading-none">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="px-5 pt-6 mt-6 border-t border-white/10 space-y-3">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#cdd8ff] hover:text-white">
              <span>🌐</span>
              Open Website
            </Link>
            <Link href="/api/auth/signout" className="flex items-center gap-2 text-sm font-semibold text-[#ffd0d0] hover:text-white">
              <span>🚪</span>
              Sign Out
            </Link>
          </div>
        </aside>

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-2xl border border-[#ced6ff] bg-[#eef2ff] px-4 py-3 text-sm text-[#2E3192] mb-6 flex flex-wrap items-center justify-between gap-2">
            <span>Admin workspace active. Configure pages, services, cities, integrations, and permissions.</span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                dbHealth.ok
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              DB: {dbHealth.ok ? "Healthy" : "Unavailable"}
            </span>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
