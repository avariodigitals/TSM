import { prisma } from "@/lib/prisma";
import PageContentManager from "@/components/admin/PageContentManager";

export default async function AdminSiteContentPage() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["content.homeHero", "content.pageHeroes"] } },
    orderBy: { key: "asc" },
  });

  return <PageContentManager settings={settings} />;
}
