import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { newPassword } = await request.json();

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { ok: false, message: "Password must be at least 8 characters long." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  const passwordHash = await hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      lastPasswordChange: new Date(),
    },
  });

  await logAudit({
    actorId: user.id,
    action: "user.password_changed",
    targetType: "user",
    targetId: user.id,
  });

  return NextResponse.json({ ok: true, message: "Password updated successfully." });
}
