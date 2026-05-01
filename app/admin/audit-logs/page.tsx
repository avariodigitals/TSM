import { prisma } from "@/lib/prisma";
import AuditLogsTable from "@/components/admin/AuditLogsTable";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminAuditLogsPage() {
  const auth = await requireAdminPermission("audit.view");
  if (!auth.ok) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-black text-[#231F20]">Audit Trail</h1>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to manage the audit trail.</p>
      </div>
    );
  }

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
