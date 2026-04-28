import { prisma } from "@/lib/prisma";
import SettingsManager from "@/components/admin/SettingsManager";

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });

  return <SettingsManager settings={settings} />;
}
