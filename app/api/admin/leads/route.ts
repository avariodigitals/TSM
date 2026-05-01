import { NextResponse } from "next/server";
import { LeadStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

const leadUpdateSchema = z.object({
  leadId: z.string().min(1).optional(),
  leadIds: z.array(z.string().min(1)).min(1).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  notes: z.string().optional(),
  assignedArtisanId: z.string().nullable().optional(),
}).refine((data) => Boolean(data.leadId) || Boolean(data.leadIds?.length), {
  message: "At least one lead id is required.",
});

export async function GET() {
  const auth = await requireAdminPermission("leads.view");
  if (!auth.ok) return auth.response;

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignedArtisan: {
        select: {
          id: true,
          fullName: true,
          businessName: true,
          tradeCategory: true,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, data: leads });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminPermission("leads.edit");
  if (!auth.ok) return auth.response;

  const parsed = leadUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const leadIds = parsed.data.leadIds ?? [parsed.data.leadId!];
  const before = await prisma.lead.findMany({ where: { id: { in: leadIds } } });
  const assignedById =
    parsed.data.assignedArtisanId === undefined
      ? undefined
      : parsed.data.assignedArtisanId
        ? auth.user.id
        : null;

  const leads = await prisma.$transaction(
    leadIds.map((leadId) =>
      prisma.lead.update({
        where: { id: leadId },
        data: {
          status: parsed.data.status,
          notes: parsed.data.notes,
          assignedArtisanId: parsed.data.assignedArtisanId,
          assignedById,
        },
      })
    )
  );

  await Promise.all(
    leads.map((lead) =>
      logAudit({
        actorId: auth.user.id,
        action: leadIds.length > 1 ? "lead.bulk_updated" : "lead.updated",
        targetType: "lead",
        targetId: lead.id,
        before: before.find((item) => item.id === lead.id) ?? null,
        after: lead,
        metadata: leadIds.length > 1 ? { batchSize: leadIds.length } : undefined,
      })
    )
  );

  return NextResponse.json({ ok: true, data: leadIds.length === 1 ? leads[0] : leads });
}

export async function DELETE(request: Request) {
  const auth = await requireAdminPermission("leads.delete");
  if (!auth.ok) return auth.response;

  const parsed = z.object({ leadId: z.string().min(1) }).safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const before = await prisma.lead.findUnique({ where: { id: parsed.data.leadId } });
  if (!before) {
    return NextResponse.json({ ok: false, message: "Lead not found." }, { status: 404 });
  }

  await prisma.lead.delete({ where: { id: parsed.data.leadId } });

  await logAudit({
    actorId: auth.user.id,
    action: "lead.deleted",
    targetType: "lead",
    targetId: parsed.data.leadId,
    before,
    after: null,
  });

  return NextResponse.json({ ok: true });
}
