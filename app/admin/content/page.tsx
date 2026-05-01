import { prisma } from "@/lib/prisma";
import ContentManager from "@/components/admin/ContentManager";
import { getSettingValue } from "@/lib/site-settings";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminContentPage() {
  const auth = await requireAdminPermission("content.view");
  if (!auth.ok) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-black text-[#231F20]">Content</h1>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to view content.</p>
      </div>
    );
  }

  const imagesBySlug = await getSettingValue<Record<string, string>>("content.imagesBySlug", {});

  const entries = await prisma.contentEntry.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <ContentManager
      entries={entries.map((entry) => ({
        ...entry,
        imageUrl: imagesBySlug[entry.slug] ?? null,
        updatedAt: entry.updatedAt.toISOString(),
      }))}
    />
  );
}
