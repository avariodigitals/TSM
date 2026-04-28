import { prisma } from "@/lib/prisma";
import AssignmentsManager from "@/components/admin/AssignmentsManager";

export default async function AdminAssignmentsPage() {
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
