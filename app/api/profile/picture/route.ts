import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("profilePicture") as File;

  if (!file) {
    return NextResponse.json({ ok: false, message: "No file provided" }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, message: "File must be an image." }, { status: 400 });
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ ok: false, message: "File size must not exceed 5MB." }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `profile-${user.id}-${randomBytes(8).toString("hex")}.${file.name.split(".").pop()}`;
    const filepath = join(process.cwd(), "public/uploads/profiles", filename);

    // Create directory if it doesn't exist
    await mkdir(join(process.cwd(), "public/uploads/profiles"), { recursive: true });

    // Write file
    await writeFile(filepath, buffer);

    const profilePictureUrl = `/uploads/profiles/${filename}`;

    // Update user profile picture
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profilePicture: profilePictureUrl,
      },
    });

    await logAudit({
      actorId: user.id,
      action: "user.profile_picture_updated",
      targetType: "user",
      targetId: user.id,
      metadata: {
        filename,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Profile picture updated successfully.",
      profilePictureUrl,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to upload profile picture." },
      { status: 500 }
    );
  }
}
