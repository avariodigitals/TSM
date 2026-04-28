import { prisma } from "@/lib/prisma";
import ArtisansManager from "@/components/admin/ArtisansManager";

export default async function AdminArtisansPage() {
  const artisans = await prisma.artisan.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <ArtisansManager
      artisans={artisans.map((artisan) => ({
        ...artisan,
        createdAt: artisan.createdAt.toISOString(),
      }))}
    />
  );
}
