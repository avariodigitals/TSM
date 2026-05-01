import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { checkDatabaseHealth } from "@/lib/db-health";
import { toCsv } from "@/lib/export";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const auth = await requireAdminPermission(format === "csv" ? "audit.export" : "audit.view");
  if (!auth.ok) return auth.response;

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (format === "csv") {
    const csv = toCsv(
      ["When", "Actor", "Actor Email", "Action", "Target Type", "Target ID", "Metadata", "Before", "After"],
      logs.map((log) => [
        log.createdAt.toISOString(),
        log.actor.fullName,
        log.actor.email,
        log.action,
        log.targetType,
        log.targetId ?? "",
        log.metadata,
        log.before,
        log.after,
      ])
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="audit-trail-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ ok: true, data: logs });
}

export async function DELETE() {
  const auth = await requireAdminPermission("audit.clear");
  if (!auth.ok) return auth.response;

  const health = await checkDatabaseHealth();
  if (!health.ok) {
    return NextResponse.json({ ok: false, message: "Database must be healthy before clearing audit logs." }, { status: 503 });
  }

  const result = await prisma.auditLog.deleteMany({});

  return NextResponse.json({ ok: true, deletedCount: result.count });
}
