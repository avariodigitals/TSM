import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { checkDatabaseHealth } from "@/lib/db-health";
import { logAudit } from "@/lib/audit";

export async function DELETE() {
  const auth = await requireAdminPermission("notifications.clear");
  if (!auth.ok) return auth.response;

  const health = await checkDatabaseHealth();
  if (!health.ok) {
    return NextResponse.json({ ok: false, message: "Database must be healthy before clearing logs." }, { status: 503 });
  }

  const result = await prisma.notificationLog.deleteMany({});

  await logAudit({
    actorId: auth.user.id,
    action: "notification_logs.cleared",
    targetType: "notificationLog",
    metadata: { deletedCount: result.count },
  });

  return NextResponse.json({ ok: true, deletedCount: result.count });
}
