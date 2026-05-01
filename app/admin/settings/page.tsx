import { prisma } from "@/lib/prisma";
import SettingsManager from "@/components/admin/SettingsManager";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminSettingsPage() {
  const auth = await requireAdminPermission("settings.view");
  if (!auth.ok) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-black text-[#231F20]">Settings</h1>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to view settings.</p>
      </div>
    );
  }

  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });

  return <SettingsManager settings={settings} />;
}
