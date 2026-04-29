import { prisma } from "@/lib/prisma";

type DashboardStats = {
  totalLeads: number;
  openLeads: number;
  pendingArtisans: number;
  approvedArtisans: number;
  totalAssignments: number;
  totalContent: number;
  totalSettings: number;
  totalUsers: number;
};

const emptyStats: DashboardStats = {
  totalLeads: 0,
  openLeads: 0,
  pendingArtisans: 0,
  approvedArtisans: 0,
  totalAssignments: 0,
  totalContent: 0,
  totalSettings: 0,
  totalUsers: 0,
};

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  try {
    // Run sequentially to reduce pool contention when Neon is under pressure.
    const totalLeads = await prisma.lead.count();
    const openLeads = await prisma.lead.count({
      where: { status: { in: ["NEW", "REVIEWED", "ASSIGNED", "IN_PROGRESS"] } },
    });
    const pendingArtisans = await prisma.artisan.count({ where: { status: "PENDING" } });
    const approvedArtisans = await prisma.artisan.count({ where: { status: "APPROVED" } });
    const totalAssignments = await prisma.artisanAssignment.count();
    const totalContent = await prisma.contentEntry.count();
    const totalSettings = await prisma.setting.count();
    const totalUsers = await prisma.user.count();

    return {
      totalLeads,
      openLeads,
      pendingArtisans,
      approvedArtisans,
      totalAssignments,
      totalContent,
      totalSettings,
      totalUsers,
    };
  } catch {
    return emptyStats;
  }
}
