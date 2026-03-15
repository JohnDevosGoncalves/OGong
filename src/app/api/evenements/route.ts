import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, sanitize } from "@/lib/api-utils";
import { createEventSchema } from "@/lib/validations";

// GET /api/evenements — liste des événements de l'utilisateur connecté
export async function GET() {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  const evenements = await prisma.evenement.findMany({
    where: { createurId: userId },
    include: {
      _count: { select: { participants: true } },
    },
    orderBy: { date: "desc" },
  });

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

    return NextResponse.json(evenement, { status: 201 });
  } catch (error) {
    console.error("Erreur création événement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'événement." },
      { status: 500 }
    );
  }
}
