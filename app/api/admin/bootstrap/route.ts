import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

interface BootstrapPayload {
  fullName: string;
  email: string;
  password: string;
  token: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<BootstrapPayload>;

    if (!body.fullName || !body.email || !body.password || !body.token) {
      return NextResponse.json({ ok: false, message: "Missing required fields." }, { status: 400 });
    }

    if (!process.env.ADMIN_BOOTSTRAP_TOKEN) {
      return NextResponse.json(
        { ok: false, message: "ADMIN_BOOTSTRAP_TOKEN is not configured." },
        { status: 500 }
      );
    }

    if (body.token !== process.env.ADMIN_BOOTSTRAP_TOKEN) {
      return NextResponse.json({ ok: false, message: "Invalid bootstrap token." }, { status: 403 });
    }

    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        { ok: false, message: "Bootstrap already completed. Use admin user management instead." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email.toLowerCase().trim(),
        passwordHash,
        role: UserRole.SUPER_ADMIN,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    await logAudit({
      actorId: user.id,
      action: "bootstrap.super_admin_created",
      targetType: "user",
      targetId: user.id,
      after: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Super admin created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to bootstrap admin user." }, { status: 500 });
  }
}
