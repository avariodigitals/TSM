import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getSettingValue, upsertSettingValue } from "@/lib/site-settings";

const payloadSchema = z.object({
  slug: z.string().min(2),
  imageUrl: z.string().optional(),
});

export async function GET() {
  const auth = await requireAdminPermission("content.view");
  if (!auth.ok) return auth.response;

  const imagesBySlug = await getSettingValue<Record<string, string>>("content.imagesBySlug", {});
  return NextResponse.json({ ok: true, data: imagesBySlug });
}

export async function POST(request: Request) {
  const auth = await requireAdminPermission("content.edit");
  if (!auth.ok) return auth.response;

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const imagesBySlug = await getSettingValue<Record<string, string>>("content.imagesBySlug", {});
  const nextMap = { ...imagesBySlug };

  if (parsed.data.imageUrl && parsed.data.imageUrl.trim()) {
    nextMap[parsed.data.slug] = parsed.data.imageUrl.trim();
  } else {
    delete nextMap[parsed.data.slug];
  }

  await upsertSettingValue(
    "content.imagesBySlug",
    nextMap,
    "Blog/content image URLs mapped by content slug"
  );

  return NextResponse.json({ ok: true, data: nextMap });
}
