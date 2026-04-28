import { NextResponse } from "next/server";
import { ArtisanStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

const artisanUpdateSchema = z.object({
  artisanId: z.string().min(1).optional(),
  artisanIds: z.array(z.string().min(1)).min(1).optional(),
  status: z.nativeEnum(ArtisanStatus).optional(),
  internalNotes: z.string().optional(),
}).refine((data) => Boolean(data.artisanId) || Boolean(data.artisanIds?.length), {
  message: "At least one artisan id is required.",
});

export async function GET() {
  const auth = await requireAdminPermission("artisans.manage");
  if (!auth.ok) return auth.response;

  const artisans = await prisma.artisan.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, data: artisans });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminPermission("artisans.manage");
  if (!auth.ok) return auth.response;

  const parsed = artisanUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const artisanIds = parsed.data.artisanIds ?? [parsed.data.artisanId!];
  const before = await prisma.artisan.findMany({ where: { id: { in: artisanIds } } });

  const approvedAt = parsed.data.status === ArtisanStatus.APPROVED ? new Date() : undefined;
  const artisans = await prisma.$transaction(
    artisanIds.map((artisanId) =>
      prisma.artisan.update({
        where: { id: artisanId },
        data: {
          status: parsed.data.status,
          internalNotes: parsed.data.internalNotes,
          approvedAt,
        },
      })
    )
  );

  await Promise.all(
    artisans.map((artisan) =>
      logAudit({
        actorId: auth.user.id,
        action: artisanIds.length > 1 ? "artisan.bulk_updated" : "artisan.updated",
        targetType: "artisan",
        targetId: artisan.id,
        before: before.find((item) => item.id === artisan.id) ?? null,
        after: artisan,
        metadata: artisanIds.length > 1 ? { batchSize: artisanIds.length } : undefined,
      })
    )
  );

  return NextResponse.json({ ok: true, data: artisanIds.length === 1 ? artisans[0] : artisans });
}
