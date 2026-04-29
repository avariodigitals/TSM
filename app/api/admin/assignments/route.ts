import { NextResponse } from "next/server";
import { AssignmentStatus, LeadStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { notifyArtisanAssignment, notifyUserAssignment } from "@/lib/notifications";

const assignmentCreateSchema = z.object({
  leadId: z.string().min(1),
  artisanId: z.string().min(1),
  notes: z.string().optional(),
});

const assignmentUpdateSchema = z.object({
  assignmentId: z.string().min(1),
  status: z.nativeEnum(AssignmentStatus),
  notes: z.string().optional(),
});

export async function GET() {
  const auth = await requireAdminPermission("assignments.manage");
  if (!auth.ok) return auth.response;

  const assignments = await prisma.artisanAssignment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      lead: true,
      artisan: true,
      assignedBy: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return NextResponse.json({ ok: true, data: assignments });
}

export async function POST(request: Request) {
  const auth = await requireAdminPermission("assignments.manage");
  if (!auth.ok) return auth.response;

  const parsed = assignmentCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const assignment = await prisma.artisanAssignment.create({
    data: {
      leadId: parsed.data.leadId,
      artisanId: parsed.data.artisanId,
      notes: parsed.data.notes,
      status: AssignmentStatus.ASSIGNED,
      assignedById: auth.user.id,
    },
  });

  const lead = await prisma.lead.update({
    where: { id: parsed.data.leadId },
    data: {
      status: LeadStatus.ASSIGNED,
      assignedArtisanId: parsed.data.artisanId,
      assignedById: auth.user.id,
    },
  });

  const artisan = await prisma.artisan.findUnique({
    where: { id: parsed.data.artisanId },
    select: {
      email: true,
      fullName: true,
      businessName: true,
      tradeCategory: true,
    },
  });

  if (artisan) {
    await notifyArtisanAssignment({
      recipientEmail: artisan.email,
      recipientName: artisan.fullName,
      leadName: lead.fullName,
      serviceNeeded: lead.serviceNeeded,
      city: lead.city,
      notes: assignment.notes,
    });

    if (lead.email) {
      await notifyUserAssignment({
        recipientEmail: lead.email,
        recipientName: lead.fullName,
        leadName: lead.fullName,
        serviceNeeded: lead.serviceNeeded,
        city: lead.city,
        artisanName: artisan.fullName,
        artisanBusinessName: artisan.businessName,
        notes: assignment.notes,
      });
    }
  }

  await logAudit({
    actorId: auth.user.id,
    action: "assignment.created",
    targetType: "assignment",
    targetId: assignment.id,
    after: assignment,
    metadata: {
      leadId: assignment.leadId,
      artisanId: assignment.artisanId,
    },
  });

  return NextResponse.json({ ok: true, data: assignment }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminPermission("assignments.manage");
  if (!auth.ok) return auth.response;

  const parsed = assignmentUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const before = await prisma.artisanAssignment.findUnique({ where: { id: parsed.data.assignmentId } });

  const assignment = await prisma.artisanAssignment.update({
    where: { id: parsed.data.assignmentId },
    data: {
      status: parsed.data.status,
      notes: parsed.data.notes,
    },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "assignment.updated",
    targetType: "assignment",
    targetId: assignment.id,
    before,
    after: assignment,
  });

  return NextResponse.json({ ok: true, data: assignment });
}
