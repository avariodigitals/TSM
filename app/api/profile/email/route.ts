import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { newEmail } = await request.json();

  if (!newEmail || !newEmail.includes("@")) {
    return NextResponse.json(
      { ok: false, message: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  if (newEmail.toLowerCase() === user.email.toLowerCase()) {
    return NextResponse.json(
      { ok: false, message: "This is already your current email address." },
      { status: 400 }
    );
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail.toLowerCase() },
  });

  if (existingUser) {
    return NextResponse.json(
      { ok: false, message: "This email address is already in use." },
      { status: 400 }
    );
  }

  // Store as pending email for admin approval
  await prisma.user.update({
    where: { id: user.id },
    data: {
      pendingEmail: newEmail.toLowerCase(),
    },
  });

  await logAudit({
    actorId: user.id,
    action: "user.email_change_requested",
    targetType: "user",
    targetId: user.id,
    metadata: {
      currentEmail: user.email,
      pendingEmail: newEmail.toLowerCase(),
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Email change request submitted for admin approval.",
  });
}
