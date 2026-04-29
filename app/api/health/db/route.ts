import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db-health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkDatabaseHealth();

  if (!health.ok) {
    return NextResponse.json(
      { ok: false, database: "unavailable", reason: health.reason },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, database: "healthy" });
}