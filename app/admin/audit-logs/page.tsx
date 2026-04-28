import { prisma } from "@/lib/prisma";
import AuditLogsTable from "@/components/admin/AuditLogsTable";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    take: 300,
  });

  return (
    <AuditLogsTable
      logs={logs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      }))}
    />
  );
}
