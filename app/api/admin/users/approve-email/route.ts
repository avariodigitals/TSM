import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  userId: z.string().min(1),
  newEmail: z.string().email(),
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

  if (user.pendingEmail !== parsed.data.newEmail) {
    return NextResponse.json(
      { ok: false, message: "Pending email does not match." },
      { status: 400 }
    );
  }

  // Check if the new email is already in use by another user
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.newEmail },
  });

  if (existingUser && existingUser.id !== user.id) {
    return NextResponse.json(
      { ok: false, message: "This email address is already in use." },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      email: parsed.data.newEmail.toLowerCase(),
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
    action: "user.email_changed",
    targetType: "user",
    targetId: updatedUser.id,
    metadata: {
      oldEmail: user.email,
      newEmail: updatedUser.email,
      approvedBy: auth.user.id,
    },
  });

  return NextResponse.json({ ok: true, data: updatedUser });
}
