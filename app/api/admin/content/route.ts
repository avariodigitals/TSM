import { NextResponse } from "next/server";
import { ContentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

const contentCreateSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  summary: z.string().optional(),
  body: z.string().min(2),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
});

const contentUpdateSchema = z.object({
  contentId: z.string().min(1),
  title: z.string().min(2).optional(),
  summary: z.string().nullable().optional(),
  body: z.string().min(2).optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  status: z.nativeEnum(ContentStatus).optional(),
});

export async function GET() {
  const auth = await requireAdminPermission("content.view");
  if (!auth.ok) return auth.response;

  const entries = await prisma.contentEntry.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ ok: true, data: entries });
}

export async function POST(request: Request) {
  const auth = await requireAdminPermission("content.edit");
  if (!auth.ok) return auth.response;

  const parsed = contentCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const entry = await prisma.contentEntry.create({
    data: {
      ...parsed.data,
      publishedAt: parsed.data.status === ContentStatus.PUBLISHED ? new Date() : null,
    },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "content.created",
    targetType: "content",
    targetId: entry.id,
    after: entry,
  });

  return NextResponse.json({ ok: true, data: entry }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminPermission("content.edit");
  if (!auth.ok) return auth.response;

  const parsed = contentUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const before = await prisma.contentEntry.findUnique({ where: { id: parsed.data.contentId } });

  const entry = await prisma.contentEntry.update({
    where: { id: parsed.data.contentId },
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      body: parsed.data.body,
      seoTitle: parsed.data.seoTitle,
      seoDescription: parsed.data.seoDescription,
      status: parsed.data.status,
      publishedAt: parsed.data.status === ContentStatus.PUBLISHED ? new Date() : undefined,
    },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "content.updated",
    targetType: "content",
    targetId: entry.id,
    before,
    after: entry,
  });

  return NextResponse.json({ ok: true, data: entry });
}
