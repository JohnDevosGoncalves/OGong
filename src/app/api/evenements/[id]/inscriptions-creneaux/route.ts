import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, getEventWithOwnership } from "@/lib/api-utils";

// GET /api/evenements/[id]/inscriptions-creneaux — liste des inscriptions
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  const inscriptions = await prisma.inscriptionCreneau.findMany({
    where: { creneau: { exposant: { evenementId: id } } },
    include: {
      participant: { select: { id: true, nom: true, prenom: true, email: true, numero: true } },
      creneau: {
        include: {
          exposant: { include: { societe: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(inscriptions);
}

// POST /api/evenements/[id]/inscriptions-creneaux — inscrire un participant à un créneau
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  const body = await request.json();
  const { participantId, creneauId } = body;

  if (!participantId || !creneauId) {
    return NextResponse.json(
      { error: "participantId et creneauId sont requis" },
      { status: 400 }
    );
  }

  // Vérifier que le participant appartient à cet événement
  const participant = await prisma.participant.findFirst({
    where: { id: participantId, evenementId: id },
  });
  if (!participant) {
    return NextResponse.json(
      { error: "Participant introuvable pour cet événement" },
      { status: 404 }
    );
  }

  // Vérifier que le créneau appartient à un exposant de cet événement
  const creneau = await prisma.creneau.findFirst({
    where: { id: creneauId, exposant: { evenementId: id } },
    include: { _count: { select: { inscriptions: true } } },
  });
  if (!creneau) {
    return NextResponse.json(
      { error: "Créneau introuvable pour cet événement" },
      { status: 404 }
    );
  }

  // Vérifier la capacité
  if (creneau._count.inscriptions >= creneau.maxParticipants) {
    return NextResponse.json(
      { error: "Ce créneau est complet." },
      { status: 409 }
    );
  }

  // Vérifier qu'il n'y a pas de conflit horaire pour ce participant
  const existingInscriptions = await prisma.inscriptionCreneau.findMany({
    where: { participantId },
    include: { creneau: true },
  });

  const hasConflict = existingInscriptions.some((ins) => {
    // Les créneaux se chevauchent si l'un commence avant que l'autre ne finisse
    return ins.creneau.heureDebut < creneau.heureFin && ins.creneau.heureFin > creneau.heureDebut;
  });

  if (hasConflict) {
    return NextResponse.json(
      { error: "Ce participant a déjà un créneau à cet horaire." },
      { status: 409 }
    );
  }

  // Vérifier qu'il n'est pas déjà inscrit à ce créneau
  const existingInscription = await prisma.inscriptionCreneau.findUnique({
    where: { participantId_creneauId: { participantId, creneauId } },
  });
  if (existingInscription) {
    return NextResponse.json(
      { error: "Ce participant est déjà inscrit à ce créneau." },
      { status: 409 }
    );
  }

  const inscription = await prisma.inscriptionCreneau.create({
    data: { participantId, creneauId },
    include: {
      participant: { select: { id: true, nom: true, prenom: true } },
      creneau: { include: { exposant: { include: { societe: true } } } },
    },
  });

  return NextResponse.json(inscription, { status: 201 });
}

// DELETE /api/evenements/[id]/inscriptions-creneaux — annuler une inscription
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
  const inscriptionId = searchParams.get("inscriptionId");

  if (!inscriptionId) {
    return NextResponse.json({ error: "inscriptionId requis" }, { status: 400 });
  }

  // Vérifier que l'inscription appartient à cet événement
  const inscription = await prisma.inscriptionCreneau.findFirst({
    where: { id: inscriptionId, creneau: { exposant: { evenementId: id } } },
  });

  if (!inscription) {
    return NextResponse.json(
      { error: "Inscription introuvable pour cet événement" },
      { status: 404 }
    );
  }

  await prisma.inscriptionCreneau.delete({ where: { id: inscriptionId } });

  return NextResponse.json({ success: true });
}
