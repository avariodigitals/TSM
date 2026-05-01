import { prisma } from "@/lib/prisma";
import ArtisansManager from "@/components/admin/ArtisansManager";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminArtisansPage() {
  const auth = await requireAdminPermission("artisans.view");
  if (!auth.ok) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-black text-[#231F20]">Artisan Registrations</h1>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to manage artisan registrations.</p>
      </div>
    );
  }

  const artisans = await prisma.artisan.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <ArtisansManager
      artisans={artisans.map((artisan) => ({
        ...artisan,
        createdAt: artisan.createdAt.toISOString(),
        updatedAt: artisan.updatedAt.toISOString(),
        approvedAt: artisan.approvedAt?.toISOString() ?? null,
      }))}
    />
  );
}
