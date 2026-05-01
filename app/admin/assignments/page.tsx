import { prisma } from "@/lib/prisma";
import AssignmentsManager from "@/components/admin/AssignmentsManager";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminAssignmentsPage() {
  const auth = await requireAdminPermission("assignments.view");
  if (!auth.ok) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-black text-[#231F20]">Artisan Placements</h1>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to view assignments.</p>
      </div>
    );
  }

  const assignments = await prisma.artisanAssignment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      lead: true,
      artisan: true,
      assignedBy: true,
    },
    take: 100,
  });

  const leads = await prisma.lead.findMany({
    where: {
      status: {
        in: ["NEW", "REVIEWED", "ASSIGNED", "IN_PROGRESS"],
      },
    },
    select: {
      id: true,
      fullName: true,
      serviceNeeded: true,
      city: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const artisans = await prisma.artisan.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      fullName: true,
      tradeCategory: true,
    },
    orderBy: { fullName: "asc" },
    take: 200,
  });

  return (
    <AssignmentsManager
      assignments={assignments.map((assignment) => ({
        ...assignment,
        createdAt: assignment.createdAt.toISOString(),
      }))}
      leads={leads}
      artisans={artisans}
    />
  );
}
