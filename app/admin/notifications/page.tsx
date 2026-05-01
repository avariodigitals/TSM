import { prisma } from "@/lib/prisma";
import NotificationLogsTable from "@/components/admin/NotificationLogsTable";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminNotificationsPage() {
  const auth = await requireAdminPermission("notifications.view");
  if (!auth.ok) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-black text-[#231F20]">Notification Delivery</h1>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to manage notification logs.</p>
      </div>
    );
  }

  const logs = await prisma.notificationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <NotificationLogsTable
      logs={logs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      }))}
    />
  );
}
