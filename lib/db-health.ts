import { prisma } from "@/lib/prisma";

export function isDatabaseConnectivityError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("can't reach database server") ||
    message.includes("prismaclientinitializationerror") ||
    message.includes("p1001") ||
    message.includes("connection")
  );
}

export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      reason: isDatabaseConnectivityError(error) ? "connectivity" : "unknown",
    };
  }
}