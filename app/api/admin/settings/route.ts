import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import type { Permission } from "@/lib/rbac";

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  description: z.string().optional(),
});

export async function GET() {
  const auth = await requireAdminPermission("settings.view");
  if (!auth.ok) return auth.response;

  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ ok: true, data: settings });
}

export async function POST(request: Request) {
  const parsed = settingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const requiredPermission: Permission = parsed.data.key.startsWith("catalog.")
    ? "catalog.edit"
    : parsed.data.key.startsWith("content.")
      ? "content.edit"
      : parsed.data.key.startsWith("rbac.")
        ? "users.edit"
      : parsed.data.key.startsWith("notifications.")
        ? "notifications.clear"
        : "settings.edit";

  const auth = await requireAdminPermission(requiredPermission);
  if (!auth.ok) return auth.response;

  const before = await prisma.setting.findUnique({ where: { key: parsed.data.key } });

  const setting = await prisma.setting.upsert({
    where: { key: parsed.data.key },
    update: {
      value: parsed.data.value as never,
      description: parsed.data.description,
    },
    create: {
      key: parsed.data.key,
      value: parsed.data.value as never,
      description: parsed.data.description,
    },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "setting.upserted",
    targetType: "setting",
    targetId: setting.id,
    before,
    after: setting,
    metadata: { key: setting.key },
  });

  return NextResponse.json({ ok: true, data: setting });
}
