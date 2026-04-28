import { prisma } from "@/lib/prisma";
import LeadsManager from "@/components/admin/LeadsManager";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignedArtisan: {
        select: {
          fullName: true,
          businessName: true,
        },
      },
    },
    take: 100,
  });

  const artisans = await prisma.artisan.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      fullName: true,
      businessName: true,
      tradeCategory: true,
    },
    orderBy: { fullName: "asc" },
  });

  return <LeadsManager leads={leads} artisans={artisans} />;
}
