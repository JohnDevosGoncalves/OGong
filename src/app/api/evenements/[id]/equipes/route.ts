import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, getEventWithOwnership } from "@/lib/api-utils";
import { generateTeamsSchema } from "@/lib/validations";

/**
 * Les équipes sont stockées via le champ `numero` du participant :
 * - numero = numéro d'équipe (1, 2, 3, ...)
 * - Les participants sans équipe ont numero = null ou 0
 *
 * Cette approche réutilise le champ existant sans modifier le schéma Prisma.
 * Pour le format "team", le champ `numero` représente le numéro d'équipe.
 */

interface TeamMember {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  numero: number | null;
}

interface Team {
  numero: number;
  membres: TeamMember[];
}

function groupParticipantsIntoTeams(participants: TeamMember[]): Team[] {
  const teams = new Map<number, TeamMember[]>();
  for (const p of participants) {
    if (p.numero && p.numero > 0) {
      if (!teams.has(p.numero)) teams.set(p.numero, []);
      teams.get(p.numero)!.push(p);
    }
  }
  return Array.from(teams.entries())
    .sort(([a], [b]) => a - b)
    .map(([numero, membres]) => ({ numero, membres }));
}

// GET /api/evenements/[id]/equipes — liste des équipes
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  const participants = await prisma.participant.findMany({
    where: { evenementId: id },
    select: { id: true, nom: true, prenom: true, email: true, numero: true },
    orderBy: { createdAt: "asc" },
  });

  const equipes = groupParticipantsIntoTeams(participants);
  const sansEquipe = participants.filter((p) => !p.numero || p.numero <= 0);

  return NextResponse.json({ equipes, sansEquipe });
}

// POST /api/evenements/[id]/equipes — générer des équipes équilibrées
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

  // Mode swap : déplacer un participant d'une équipe à une autre
  if (body.action === "swap") {
    const { participantId, nouvelleEquipe } = body;
    if (!participantId || typeof nouvelleEquipe !== "number" || nouvelleEquipe < 1) {
      return NextResponse.json(
        { error: "participantId et nouvelleEquipe (>= 1) sont requis" },
        { status: 400 }
      );
    }

    const participant = await prisma.participant.findFirst({
      where: { id: participantId, evenementId: id },
    });
    if (!participant) {
      return NextResponse.json(
        { error: "Participant introuvable pour cet événement" },
        { status: 404 }
      );
    }

    await prisma.participant.update({
      where: { id: participantId },
      data: { numero: nouvelleEquipe },
    });

    return NextResponse.json({ success: true });
  }

  // Mode génération : créer des équipes équilibrées
  const parsed = generateTeamsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { nbEquipes } = parsed.data;

  const participants = await prisma.participant.findMany({
    where: { evenementId: id },
    orderBy: { createdAt: "asc" },
  });

  if (participants.length < nbEquipes) {
    return NextResponse.json(
      { error: `Il faut au moins ${nbEquipes} participants pour former ${nbEquipes} équipes.` },
      { status: 400 }
    );
  }

  // Mélanger les participants aléatoirement pour des équipes équilibrées
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  // Assigner chaque participant à une équipe (round-robin)
  const updates = shuffled.map((p, i) =>
    prisma.participant.update({
      where: { id: p.id },
      data: { numero: (i % nbEquipes) + 1 },
    })
  );

  await Promise.all(updates);

  // Récupérer les résultats
  const updatedParticipants = await prisma.participant.findMany({
    where: { evenementId: id },
    select: { id: true, nom: true, prenom: true, email: true, numero: true },
    orderBy: { createdAt: "asc" },
  });

  const equipes = groupParticipantsIntoTeams(updatedParticipants);

  return NextResponse.json({
    success: true,
    nbEquipes: equipes.length,
    equipes,
  }, { status: 201 });
}

// DELETE /api/evenements/[id]/equipes — supprimer toutes les équipes
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  // Remettre tous les numéros à null
  await prisma.participant.updateMany({
    where: { evenementId: id },
    data: { numero: null },
  });

  return NextResponse.json({ success: true });
}
