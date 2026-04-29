import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sanitizeExtension(fileName: string) {
  const rawExt = path.extname(fileName).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(rawExt)) {
    return rawExt;
  }
  return ".jpg";
}

export async function POST(request: Request) {
  const auth = await requireAdminPermission("content.manage");
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "No file uploaded." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { ok: false, message: "Unsupported file type. Use JPG, PNG, WEBP, or GIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { ok: false, message: "File too large. Maximum size is 5MB." },
      { status: 400 }
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "blog");
  await mkdir(uploadsDir, { recursive: true });

  const extension = sanitizeExtension(file.name);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  const bytes = await file.arrayBuffer();

  await writeFile(filePath, Buffer.from(bytes));

  return NextResponse.json({
    ok: true,
    data: {
      imageUrl: `/uploads/blog/${fileName}`,
    },
  });
}
