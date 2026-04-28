import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getEffectivePermissionsForUser } from "@/lib/admin-auth";
import type { Permission } from "@/lib/rbac";

const links = [
  { href: "/admin", label: "Dashboard", permission: null },
  { href: "/admin/leads", label: "Enquiries / Leads", permission: "leads.manage" },
  { href: "/admin/artisans", label: "Artisan Registrations", permission: "artisans.manage" },
  { href: "/admin/assignments", label: "Artisan Placements", permission: "assignments.manage" },
  { href: "/admin/site-content", label: "Page Content", permission: "content.manage" },
  { href: "/admin/catalog", label: "Services & Cities", permission: "catalog.manage" },
  { href: "/admin/content", label: "Content", permission: "content.manage" },
  { href: "/admin/settings", label: "Settings", permission: "settings.manage" },
  { href: "/admin/notifications", label: "Notifications", permission: "notifications.manage" },
  { href: "/admin/users", label: "Admin Users", permission: "users.manage" },
  { href: "/admin/audit-logs", label: "Audit Trail", permission: "users.manage" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/admin-login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email ?? "" },
    select: { role: true, permissionOverrides: true, isActive: true, email: true },
  });

  if (!user || !user.isActive) {
    redirect("/auth/admin-login");
  }

  const effectivePermissions = await getEffectivePermissionsForUser(user);
  const visibleLinks = links.filter((link) => !link.permission || effectivePermissions.includes(link.permission as Permission));

  return (
    <div className="min-h-screen bg-[#EAF2DD]">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="min-h-screen bg-[#0f5c2f] text-white">
          <div className="px-5 py-6 border-b border-white/10">
            <h2 className="text-2xl font-black tracking-tight">
              Total Serve <span className="text-[#b9f373]">Admin</span>
            </h2>
            <p className="mt-2 text-xs uppercase tracking-wide text-[#d8efc6]">Signed in as</p>
            <p className="text-sm font-semibold break-all">{session.user.email}</p>
          </div>

          <nav className="px-3 py-4 space-y-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#e6f4d9] hover:bg-white/15"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="px-5 pt-6 mt-6 border-t border-white/10 space-y-3">
            <Link href="/" className="block text-sm font-semibold text-[#d8efc6] hover:text-white">
              Open Website
            </Link>
            <Link href="/api/auth/signout" className="block text-sm font-semibold text-[#ffd0d0] hover:text-white">
              Sign Out
            </Link>
          </div>
        </aside>

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-2xl border border-[#c6deaa] bg-[#d9ebc3] px-4 py-3 text-sm text-[#195f3c] mb-6">
            Admin workspace active. Configure pages, services, cities, integrations, and permissions.
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
