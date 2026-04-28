import { prisma } from "@/lib/prisma";
import ContentManager from "@/components/admin/ContentManager";

export default async function AdminContentPage() {
  const entries = await prisma.contentEntry.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <ContentManager
      entries={entries.map((entry) => ({
        ...entry,
        updatedAt: entry.updatedAt.toISOString(),
      }))}
    />
  );
}
