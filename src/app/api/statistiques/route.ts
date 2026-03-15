import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/statistiques — statistiques globales de l'utilisateur
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  // Nombre d'événements par statut
  const evenements = await prisma.evenement.findMany({
    where: { createurId: userId },
    select: {
      id: true,
      titre: true,
      format: true,
      date: true,
      status: true,
      _count: { select: { participants: true, tours: true } },
    },
    orderBy: { date: "desc" },
  });

  const totalEvenements = evenements.length;
  const evenementsTermines = evenements.filter((e) => e.status === "termine").length;
  const evenementsEnCours = evenements.filter((e) => e.status === "en_cours").length;

  // Nombre total de participants (tous événements confondus)
  const totalParticipants = await prisma.participant.count({
    where: { evenement: { createurId: userId } },
  });

  // Nombre total de tours réalisés
  const totalTours = await prisma.tour.count({
    where: {
      evenement: { createurId: userId },
      status: "termine",
    },
  });

  // Nombre total de rencontres uniques (paires via AffectationTable)
  const affectations = await prisma.affectationTable.findMany({
    where: { tour: { evenement: { createurId: userId } } },
    select: { participantId: true, tableId: true, tourId: true },
  });

  // Grouper par (tourId, tableId) pour trouver qui était à la même table
  const tableGroups = new Map<string, string[]>();
  for (const aff of affectations) {
    const key = `${aff.tourId}|${aff.tableId}`;
    if (!tableGroups.has(key)) tableGroups.set(key, []);
    tableGroups.get(key)!.push(aff.participantId);
  }

  const pairesUniques = new Set<string>();
  for (const group of tableGroups.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const key = group[i] < group[j]
          ? `${group[i]}|${group[j]}`
          : `${group[j]}|${group[i]}`;
        pairesUniques.add(key);
      }
    }
  }

  // Historique des événements (les 20 derniers)
  const historique = evenements.slice(0, 20).map((e) => ({
    id: e.id,
    titre: e.titre,
    format: e.format,
    date: e.date,
    status: e.status,
    nbParticipants: e._count.participants,
    nbTours: e._count.tours,
  }));

  // Répartition par format
  const parFormat = {
    speed_meeting: evenements.filter((e) => e.format === "speed_meeting").length,
    team: evenements.filter((e) => e.format === "team").length,
    job_dating: evenements.filter((e) => e.format === "job_dating").length,
  };

  return NextResponse.json({
    totalEvenements,
    evenementsTermines,
    evenementsEnCours,
    totalParticipants,
    totalTours,
    totalRencontres: pairesUniques.size,
    parFormat,
    historique,
  });
}
