import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { checkDatabaseHealth } from "@/lib/db-health";
import { getSettingValue } from "@/lib/site-settings";
import { logAudit } from "@/lib/audit";

type MaintenanceSettings = {
  notificationLogRetentionDays: number;
  auditLogRetentionDays: number;
};

const defaultMaintenanceSettings: MaintenanceSettings = {
  notificationLogRetentionDays: 90,
  auditLogRetentionDays: 180,
};

function cutoffDate(days: number) {
  const safeDays = Number.isFinite(days) && days > 0 ? days : 90;
  return new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);
}

export async function POST() {
  const auth = await requireAdminPermission("settings.clearLogs");
  if (!auth.ok) return auth.response;

  const health = await checkDatabaseHealth();
  if (!health.ok) {
    return NextResponse.json({ ok: false, message: "Database must be healthy before clearing old logs." }, { status: 503 });
  }

  const settings = await getSettingValue<MaintenanceSettings>("site.maintenance", defaultMaintenanceSettings);
  const notificationCutoff = cutoffDate(settings.notificationLogRetentionDays);
  const auditCutoff = cutoffDate(settings.auditLogRetentionDays);

  const [notificationResult, auditResult] = await prisma.$transaction([
    prisma.notificationLog.deleteMany({ where: { createdAt: { lt: notificationCutoff } } }),
    prisma.auditLog.deleteMany({ where: { createdAt: { lt: auditCutoff } } }),
  ]);

  await logAudit({
    actorId: auth.user.id,
    action: "maintenance.retention_applied",
    targetType: "database",
    metadata: {
      notificationLogRetentionDays: settings.notificationLogRetentionDays,
      auditLogRetentionDays: settings.auditLogRetentionDays,
      notificationLogsDeleted: notificationResult.count,
      auditLogsDeleted: auditResult.count,
    },
  });

  return NextResponse.json({
    ok: true,
    notificationLogsDeleted: notificationResult.count,
    auditLogsDeleted: auditResult.count,
  });
}
