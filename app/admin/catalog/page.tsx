import { prisma } from "@/lib/prisma";
import CatalogManager from "@/components/admin/CatalogManager";

export default async function AdminCatalogPage() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["catalog.services", "catalog.cities", "catalog.mappings"] } },
    orderBy: { key: "asc" },
  });

  return <CatalogManager settings={settings} />;
}
