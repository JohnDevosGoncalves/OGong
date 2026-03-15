import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, getEventWithOwnership } from "@/lib/api-utils";
import { addCreneauSchema } from "@/lib/validations";

// GET /api/evenements/[id]/creneaux — liste des créneaux
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  const creneaux = await prisma.creneau.findMany({
    where: { exposant: { evenementId: id } },
    include: {
      exposant: { include: { societe: true } },
      _count: { select: { inscriptions: true } },
    },
    orderBy: { heureDebut: "asc" },
  });

  return NextResponse.json(creneaux);
}

// POST /api/evenements/[id]/creneaux — générer ou ajouter des créneaux
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { evenement, error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;
  if (!evenement) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  const body = await request.json();

  // Mode 1 : Ajout d'un créneau unique
  if (body.exposantId && body.heureDebut && body.heureFin) {
    const parsed = addCreneauSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Vérifier que l'exposant appartient à cet événement
    const exposant = await prisma.exposant.findFirst({
      where: { id: parsed.data.exposantId, evenementId: id },
    });
    if (!exposant) {
      return NextResponse.json(
        { error: "Exposant introuvable pour cet événement" },
        { status: 404 }
      );
    }

    const creneau = await prisma.creneau.create({
      data: {
        heureDebut: parsed.data.heureDebut,
        heureFin: parsed.data.heureFin,
        maxParticipants: parsed.data.capacite,
        exposantId: parsed.data.exposantId,
      },
    });

    return NextResponse.json(creneau, { status: 201 });
  }

  // Mode 2 : Génération automatique de créneaux pour tous les exposants
  const exposants = await prisma.exposant.findMany({
    where: { evenementId: id },
  });

  if (exposants.length === 0) {
    return NextResponse.json(
      { error: "Aucun exposant inscrit. Ajoutez des exposants d'abord." },
      { status: 400 }
    );
  }

  // Paramètres de génération
  const heureDebut = body.heureDebut || evenement.heureDebut;
  const heureFin = body.heureFin || evenement.heureFin;
  const dureeTour = body.dureeTour || evenement.tempsParoleTour; // en secondes
  const dureePause = body.dureePause || evenement.tempsPauseTour; // en secondes
  const capacite = body.capacite || 1;

  // Parser les heures
  const [startH, startM] = heureDebut.split(":").map(Number);
  const [endH, endM] = heureFin.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const dureeTourMin = Math.ceil(dureeTour / 60);
  const dureePauseMin = Math.ceil(dureePause / 60);
  const cycleDuration = dureeTourMin + dureePauseMin;

  if (cycleDuration <= 0) {
    return NextResponse.json(
      { error: "La durée du tour doit être supérieure à 0." },
      { status: 400 }
    );
  }

  // Supprimer les créneaux existants pour cet événement
  await prisma.inscriptionCreneau.deleteMany({
    where: { creneau: { exposant: { evenementId: id } } },
  });
  await prisma.creneau.deleteMany({
    where: { exposant: { evenementId: id } },
  });

  // Générer les créneaux
  const creneauxData: { heureDebut: string; heureFin: string; maxParticipants: number; exposantId: string }[] = [];
  let currentMinute = startMinutes;

  while (currentMinute + dureeTourMin <= endMinutes) {
    const slotStart = currentMinute;
    const slotEnd = currentMinute + dureeTourMin;

    const slotStartStr = `${String(Math.floor(slotStart / 60)).padStart(2, "0")}:${String(slotStart % 60).padStart(2, "0")}`;
    const slotEndStr = `${String(Math.floor(slotEnd / 60)).padStart(2, "0")}:${String(slotEnd % 60).padStart(2, "0")}`;

    for (const exposant of exposants) {
      creneauxData.push({
        heureDebut: slotStartStr,
        heureFin: slotEndStr,
        maxParticipants: capacite,
        exposantId: exposant.id,
      });
    }

    currentMinute += cycleDuration;
  }

  if (creneauxData.length === 0) {
    return NextResponse.json(
      { error: "Impossible de générer des créneaux avec ces paramètres de durée." },
      { status: 400 }
    );
  }

  await prisma.creneau.createMany({ data: creneauxData });

  return NextResponse.json({
    success: true,
    nbCreneaux: creneauxData.length,
    nbExposants: exposants.length,
    nbSlots: creneauxData.length / exposants.length,
  }, { status: 201 });
}

// DELETE /api/evenements/[id]/creneaux — supprimer un créneau
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  const { searchParams } = new URL(request.url);
  const creneauId = searchParams.get("creneauId");

  if (!creneauId) {
    return NextResponse.json({ error: "creneauId requis" }, { status: 400 });
  }

  // Vérifier que le créneau appartient à un exposant de cet événement
  const creneau = await prisma.creneau.findFirst({
    where: { id: creneauId, exposant: { evenementId: id } },
  });

  if (!creneau) {
    return NextResponse.json(
      { error: "Créneau introuvable pour cet événement" },
      { status: 404 }
    );
  }

  await prisma.creneau.delete({ where: { id: creneauId } });

  return NextResponse.json({ success: true });
}
