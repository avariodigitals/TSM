import { prisma } from "@/lib/prisma";
import CatalogManager from "@/components/admin/CatalogManager";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminCatalogPage() {
  const auth = await requireAdminPermission("catalog.view");
  if (!auth.ok) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-black text-[#231F20]">Services & Cities</h1>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to view catalog settings.</p>
      </div>
    );
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["catalog.services", "catalog.cities", "catalog.mappings"] } },
    orderBy: { key: "asc" },
  });

  return <CatalogManager settings={settings} />;
}
