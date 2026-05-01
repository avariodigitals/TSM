import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { checkDatabaseHealth } from "@/lib/db-health";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const auth = await requireAdminPermission("settings.backup");
  if (!auth.ok) return auth.response;

  const health = await checkDatabaseHealth();
  if (!health.ok) {
    return NextResponse.json({ ok: false, message: "Database must be healthy before creating a backup." }, { status: 503 });
  }

  const [
    users,
    auditLogs,
    notificationLogs,
    settings,
    contentEntries,
    leads,
    artisans,
    assignments,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.notificationLog.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.setting.findMany({ orderBy: { key: "asc" } }),
    prisma.contentEntry.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.artisan.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.artisanAssignment.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  await logAudit({
    actorId: auth.user.id,
    action: "database.backup_downloaded",
    targetType: "database",
    metadata: {
      users: users.length,
      auditLogs: auditLogs.length,
      notificationLogs: notificationLogs.length,
      settings: settings.length,
      contentEntries: contentEntries.length,
      leads: leads.length,
      artisans: artisans.length,
      assignments: assignments.length,
    },
  });

  const body = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      tables: {
        users,
        auditLogs,
        notificationLogs,
        settings,
        contentEntries,
        leads,
        artisans,
        assignments,
      },
    },
    null,
    2
  );

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="total-serve-db-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
