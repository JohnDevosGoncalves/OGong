import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/evenements — liste des événements de l'utilisateur connecté
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const evenements = await prisma.evenement.findMany({
    where: { createurId: session.user.id },
    include: {
      _count: { select: { participants: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(evenements);
}

// POST /api/evenements — créer un événement
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const {
      titre,
      description,
      messageFin,
      format,
      teamSize,
      date,
      heureDebut,
      heureFin,
      tempsParoleTour,
      tempsPauseTour,
      debutPause,
      finPause,
    } = body;

    if (!titre || !format || !date || !heureDebut || !heureFin) {
      return NextResponse.json(
        { error: "Les champs titre, format, date, heureDebut et heureFin sont requis." },
        { status: 400 }
      );
    }

    const evenement = await prisma.evenement.create({
      data: {
        titre,
        description: description || null,
        messageFin: messageFin || null,
        format,
        teamSize: teamSize || null,
        date: new Date(date),
        heureDebut,
        heureFin,
        tempsParoleTour: tempsParoleTour || 120,
        tempsPauseTour: tempsPauseTour || 30,
        debutPause: debutPause || null,
        finPause: finPause || null,
        createurId: session.user.id,
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
