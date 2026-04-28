import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdminPermission("users.manage");
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
    take: 300,
  });

  return NextResponse.json({ ok: true, data: logs });
}
