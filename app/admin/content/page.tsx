import { prisma } from "@/lib/prisma";
import ContentManager from "@/components/admin/ContentManager";
import { getSettingValue } from "@/lib/site-settings";

export default async function AdminContentPage() {
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
