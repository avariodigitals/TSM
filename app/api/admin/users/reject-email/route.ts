import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  userId: z.string().min(1),
});

export async function POST(request: Request) {
  const auth = await requireAdminPermission("users.edit");
  if (!auth.ok) return auth.response;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
  });

  if (!user) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  if (!user.pendingEmail) {
    return NextResponse.json(
      { ok: false, message: "No pending email change for this user." },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      pendingEmail: null,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "user.email_change_rejected",
    targetType: "user",
    targetId: updatedUser.id,
    metadata: {
      rejectedEmail: user.pendingEmail,
      rejectedBy: auth.user.id,
    },
  });

  return NextResponse.json({ ok: true, data: updatedUser });
}
