import { prisma } from "@/lib/prisma";
import PageContentManager from "@/components/admin/PageContentManager";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminSiteContentPage() {
  const auth = await requireAdminPermission("content.view");
  if (!auth.ok) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-black text-[#231F20]">Pages</h1>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to view page content.</p>
      </div>
    );
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["content.homeHero", "content.homeSections", "content.pageHeroes"] } },
    orderBy: { key: "asc" },
  });

  return <PageContentManager settings={settings} />;
}
