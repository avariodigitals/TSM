import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [
    totalLeads,
    openLeads,
    pendingArtisans,
    approvedArtisans,
    totalAssignments,
    totalContent,
    totalSettings,
    totalUsers,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: { in: ["NEW", "REVIEWED", "ASSIGNED", "IN_PROGRESS"] } } }),
    prisma.artisan.count({ where: { status: "PENDING" } }),
    prisma.artisan.count({ where: { status: "APPROVED" } }),
    prisma.artisanAssignment.count(),
    prisma.contentEntry.count(),
    prisma.setting.count(),
    prisma.user.count(),
  ]);

  const cards = [
    { label: "Total Enquiries", value: totalLeads },
    { label: "Open Leads", value: openLeads },
    { label: "Pending Artisan Registrations", value: pendingArtisans },
    { label: "Approved Artisans", value: approvedArtisans },
    { label: "Placements / Assignments", value: totalAssignments },
    { label: "Content Entries", value: totalContent },
    { label: "Settings", value: totalSettings },
    { label: "Admin Users", value: totalUsers },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-4xl font-black text-[#0f5c2f]">Dashboard Overview</h1>
        <p className="text-[#2b6f45] mt-1">Manage content, leads, artisan registrations, placements, settings, and user privileges.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white/90 border border-[#c9dfb3] rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[#658a5f] font-semibold">{card.label}</p>
            <p className="text-3xl font-black text-[#0f5c2f] mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
