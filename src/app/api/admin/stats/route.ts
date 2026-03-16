import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/api-utils";

// GET /api/admin/stats — statistiques globales de la plateforme
export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisMonth,
    totalEvents,
    eventsByStatus,
    eventsByFormat,
    completedPayments,
    allCredits,
    activeUserIds,
    // Nouveaux utilisateurs par mois (6 derniers mois)
    usersLast6Months,
    // Paiements des 6 derniers mois
    paymentsLast6Months,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.evenement.count(),
    prisma.evenement.groupBy({ by: ["status"], _count: true }),
    prisma.evenement.groupBy({ by: ["format"], _count: true }),
    prisma.paiement.aggregate({
      where: { status: "complete" },
      _sum: { montantEuros: true },
      _count: true,
    }),
    prisma.credit.findMany({
      select: { montant: true, type: true },
    }),
    prisma.evenement.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createurId: true },
      distinct: ["createurId"],
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.paiement.findMany({
      where: { status: "complete", createdAt: { gte: sixMonthsAgo } },
      select: { montantEuros: true, createdAt: true },
    }),
  ]);

  // Calcul crédits achetés vs utilisés
  let creditsAchetes = 0;
  let creditsUtilises = 0;
  let creditsBonus = 0;
  for (const c of allCredits) {
    if (c.type === "achat") creditsAchetes += c.montant;
    else if (c.type === "utilisation") creditsUtilises += c.montant;
    else if (c.type === "bonus") creditsBonus += c.montant;
  }

  // Status breakdown
  const statusMap: Record<string, number> = {};
  for (const s of eventsByStatus) {
    statusMap[s.status] = s._count;
  }

  // Format breakdown
  const formatMap: Record<string, number> = {};
  for (const f of eventsByFormat) {
    formatMap[f.format] = f._count;
  }

  // Nouveaux utilisateurs par mois
  const usersByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    usersByMonth[key] = 0;
  }
  for (const u of usersLast6Months) {
    const d = new Date(u.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (usersByMonth[key] !== undefined) {
      usersByMonth[key]++;
    }
  }

  // Revenus par mois
  const revenueByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    revenueByMonth[key] = 0;
  }
  for (const p of paymentsLast6Months) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (revenueByMonth[key] !== undefined) {
      revenueByMonth[key] += p.montantEuros;
    }
  }

  return NextResponse.json({
    totalUsers,
    newUsersThisMonth,
    totalEvents,
    eventsByStatus: statusMap,
    eventsByFormat: formatMap,
    totalRevenue: completedPayments._sum.montantEuros || 0,
    totalPayments: completedPayments._count,
    creditsAchetes,
    creditsUtilises,
    creditsBonus,
    creditsEnCirculation: creditsAchetes + creditsBonus - creditsUtilises,
    activeUsers: activeUserIds.length,
    usersByMonth,
    revenueByMonth,
  });
}
