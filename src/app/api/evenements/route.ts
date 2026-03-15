import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, sanitize } from "@/lib/api-utils";
import { createEventSchema } from "@/lib/validations";
import { getUserCredits } from "@/lib/stripe";

// GET /api/evenements — liste des événements de l'utilisateur connecté + collaborations
export async function GET() {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  // Événements créés par l'utilisateur
  const ownEvents = await prisma.evenement.findMany({
    where: { createurId: userId },
    include: {
      _count: { select: { participants: true } },
    },
    orderBy: { date: "desc" },
  });

  // Événements où l'utilisateur est collaborateur accepté
  const collaborations = await prisma.collaborateur.findMany({
    where: { userId, accepte: true },
    include: {
      evenement: {
        include: {
          _count: { select: { participants: true } },
        },
      },
    },
  });

  const ownWithRole = ownEvents.map((evt) => ({ ...evt, role: "createur" as const }));
  const collabWithRole = collaborations.map((c) => ({
    ...c.evenement,
    role: c.role as "co_organisateur" | "animateur",
  }));

  // Fusionner et trier par date décroissante
  const evenements = [...ownWithRole, ...collabWithRole].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return NextResponse.json(evenements);
}

// POST /api/evenements — créer un événement
export async function POST(request: Request) {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  try {
    const body = await request.json();

    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Vérifier que l'utilisateur a suffisamment de crédits
    const solde = await getUserCredits(userId);
    if (solde < 1) {
      return NextResponse.json(
        { error: "Crédits insuffisants. Veuillez acheter des crédits pour créer un événement." },
        { status: 402 }
      );
    }

    const evenement = await prisma.evenement.create({
      data: {
        titre: sanitize(data.titre),
        description: data.description ? sanitize(data.description) : null,
        messageFin: data.messageFin ? sanitize(data.messageFin) : null,
        format: data.format,
        teamSize: data.teamSize || null,
        date: new Date(data.date),
        heureDebut: data.heureDebut,
        heureFin: data.heureFin,
        tempsParoleTour: data.tempsParoleTour || 120,
        tempsPauseTour: data.tempsPauseTour || 30,
        debutPause: body.debutPause || null,
        finPause: body.finPause || null,
        createurId: userId,
      },
    });

    // Déduire 1 crédit pour la création de l'événement
    await prisma.credit.create({
      data: {
        userId,
        montant: -1,
        type: "utilisation",
        detail: `Création événement : ${sanitize(data.titre)}`,
      },
    });

    return NextResponse.json(evenement, { status: 201 });
  } catch (error) {
    console.error("Erreur création événement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'événement." },
      { status: 500 }
    );
  }
}
