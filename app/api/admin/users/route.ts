import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
});

const updateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  permissionOverrides: z.array(z.string()).optional(),
});

export async function GET() {
  const auth = await requireAdminPermission("users.manage");
  if (!auth.ok) return auth.response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      permissionOverrides: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, data: users });
}

export async function POST(request: Request) {
  const auth = await requireAdminPermission("users.manage");
  if (!auth.ok) return auth.response;

  const parsed = createUserSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase().trim(),
      passwordHash,
      role: parsed.data.role,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "user.created",
    targetType: "user",
    targetId: user.id,
    after: {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });

  return NextResponse.json({ ok: true, data: user }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminPermission("users.manage");
  if (!auth.ok) return auth.response;

  const parsed = updateUserSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const before = await prisma.user.findUnique({ where: { id: parsed.data.userId } });

  const user = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      role: parsed.data.role,
      isActive: parsed.data.isActive,
      permissionOverrides: parsed.data.permissionOverrides,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      permissionOverrides: true,
      updatedAt: true,
    },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "user.updated",
    targetType: "user",
    targetId: user.id,
    before: before
      ? {
          id: before.id,
          role: before.role,
          isActive: before.isActive,
          permissionOverrides: before.permissionOverrides,
        }
      : null,
    after: {
      id: user.id,
      role: user.role,
      isActive: user.isActive,
      permissionOverrides: user.permissionOverrides,
    },
  });

  return NextResponse.json({ ok: true, data: user });
}
