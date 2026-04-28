import { prisma } from "@/lib/prisma";

interface AuditInput {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: unknown;
  before?: unknown;
  after?: unknown;
}

export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        metadata: input.metadata as never,
        before: input.before as never,
        after: input.after as never,
      },
    });
  } catch {
    // Never block business flow if audit logging fails.
  }
}
