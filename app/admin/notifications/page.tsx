import { prisma } from "@/lib/prisma";
import NotificationLogsTable from "@/components/admin/NotificationLogsTable";

export default async function AdminNotificationsPage() {
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