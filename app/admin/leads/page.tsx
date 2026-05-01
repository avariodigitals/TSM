import { prisma } from "@/lib/prisma";
import LeadsManager from "@/components/admin/LeadsManager";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminLeadsPage() {
  const auth = await requireAdminPermission("leads.view");
  if (!auth.ok) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-black text-[#231F20]">Enquiries / Leads</h1>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to manage leads.</p>
      </div>
    );
  }

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

  return (
    <LeadsManager
      leads={leads.map((lead) => ({
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      }))}
      artisans={artisans}
    />
  );
}
