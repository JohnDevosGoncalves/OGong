import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, getEventWithOwnership } from "@/lib/api-utils";
import { calculerAffectations } from "@/lib/algorithme";

// GET /api/evenements/[id]/tours — récupérer les tours avec affectations
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    include: {
      tours: {
        orderBy: { numero: "asc" },
        include: {
          affectations: {
            include: {
              participant: { select: { id: true, nom: true, prenom: true, numero: true } },
              table: { select: { id: true, numero: true } },
            },
          },
        },
      },
      tables: { orderBy: { numero: "asc" } },
      participants: { orderBy: { numero: "asc" } },
    },
  });

  if (!evenement) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  if (evenement.createurId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // Restructurer les données pour le frontend
  const tours = evenement.tours.map((tour) => {
    // Grouper les affectations par table
    const tablesMap = new Map<number, {
      tableId: string;
      numero: number;
      participants: { id: string; nom: string; prenom: string; numero: number | null }[];
    }>();

    for (const aff of tour.affectations) {
      const tableNum = aff.table.numero;
      if (!tablesMap.has(tableNum)) {
        tablesMap.set(tableNum, {
          tableId: aff.table.id,
          numero: tableNum,
          participants: [],
        });
      }
      tablesMap.get(tableNum)!.participants.push({
        id: aff.participant.id,
        nom: aff.participant.nom,
        prenom: aff.participant.prenom,
        numero: aff.participant.numero,
      });
    }

    return {
      id: tour.id,
      numero: tour.numero,
      status: tour.status,
      tables: Array.from(tablesMap.values()).sort((a, b) => a.numero - b.numero),
    };
  });

  return NextResponse.json({
    evenement: {
      id: evenement.id,
      titre: evenement.titre,
      format: evenement.format,
      tempsParoleTour: evenement.tempsParoleTour,
      tempsPauseTour: evenement.tempsPauseTour,
      status: evenement.status,
    },
    tours,
    totalParticipants: evenement.participants.length,
    totalTables: evenement.tables.length,
  });
}

// POST /api/evenements/[id]/tours — générer les tours via l'algorithme
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    include: {
      participants: { orderBy: { numero: "asc" } },
      tours: true,
    },
  });

  if (!evenement) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  if (evenement.createurId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (evenement.participants.length < 2) {
    return NextResponse.json(
      { error: "Il faut au moins 2 participants pour lancer l'événement." },
      { status: 400 }
    );
  }

  // Si des tours existent déjà, les supprimer pour recalculer
  if (evenement.tours.length > 0) {
    await prisma.affectationTable.deleteMany({
      where: { tour: { evenementId: id } },
    });
    await prisma.tour.deleteMany({ where: { evenementId: id } });
    await prisma.table.deleteMany({ where: { evenementId: id } });
  }

  // Optionnel : nombre de tours limité
  const body = await request.json().catch(() => ({}));
  const nbTours = body.nbTours ? Number(body.nbTours) : undefined;

  // Lancer l'algorithme
  const participantIds = evenement.participants.map((p) => p.id);
  const result = calculerAffectations(participantIds, evenement.format, undefined, nbTours);

  // Déterminer les numéros de table uniques
  const tableNumeros = new Set<number>();
  for (const tour of result.tours) {
    for (const table of tour.tables) {
      tableNumeros.add(table.tableNumero);
    }
  }

  // Créer les tables en base
  const tablesCreated = await Promise.all(
    Array.from(tableNumeros)
      .sort((a, b) => a - b)
      .map((numero) =>
        prisma.table.create({
          data: { numero, evenementId: id },
        })
      )
  );

  const tableIdByNumero = new Map(tablesCreated.map((t) => [t.numero, t.id]));

  // Créer les tours et affectations
  for (const tourData of result.tours) {
    const tour = await prisma.tour.create({
      data: {
        numero: tourData.tourNumero,
        evenementId: id,
        status: "en_attente",
      },
    });

    // Créer toutes les affectations pour ce tour
    const affectations = [];
    for (const table of tourData.tables) {
      const tableId = tableIdByNumero.get(table.tableNumero);
      if (!tableId) continue;

      for (const participantId of table.participantIds) {
        affectations.push({
          participantId,
          tableId,
          tourId: tour.id,
        });
      }
    }

    if (affectations.length > 0) {
      await prisma.affectationTable.createMany({ data: affectations });
    }
  }

  // Mettre à jour le statut de l'événement
  await prisma.evenement.update({
    where: { id },
    data: { status: "en_cours" },
  });

  return NextResponse.json({
    success: true,
    nbTours: result.tours.length,
    stats: result.stats,
  });
}

// PATCH /api/evenements/[id]/tours — mettre à jour le statut d'un tour
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  if (body.tourId && body.status) {
    await prisma.tour.update({
      where: { id: body.tourId },
      data: { status: body.status },
    });
  }

  // Si on termine le dernier tour, terminer l'événement
  if (body.terminerEvenement) {
    await prisma.evenement.update({
      where: { id },
      data: { status: "termine" },
    });
  }

  return NextResponse.json({ success: true });
}
