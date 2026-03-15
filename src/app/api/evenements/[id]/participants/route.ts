import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/evenements/[id]/participants — liste des participants
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({ where: { id } });
  if (!evenement || evenement.createurId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const participants = await prisma.participant.findMany({
    where: { evenementId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(participants);
}

// POST /api/evenements/[id]/participants — ajouter un ou plusieurs participants
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({ where: { id } });
  if (!evenement || evenement.createurId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();

  // Support ajout unique ou bulk (CSV)
  const participantsData: Array<{
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  }> = Array.isArray(body) ? body : [body];

  // Valider les données
  for (const p of participantsData) {
    if (!p.nom || !p.prenom || !p.email) {
      return NextResponse.json(
        { error: `Nom, prénom et email sont requis pour chaque participant. Erreur sur: ${p.email || "inconnu"}` },
        { status: 400 }
      );
    }
  }

  // Récupérer le dernier numéro attribué
  const lastParticipant = await prisma.participant.findFirst({
    where: { evenementId: id },
    orderBy: { numero: "desc" },
  });
  let nextNumero = (lastParticipant?.numero ?? 0) + 1;

  const created = [];
  const skipped = [];

  for (const p of participantsData) {
    try {
      const participant = await prisma.participant.create({
        data: {
          nom: p.nom,
          prenom: p.prenom,
          email: p.email.toLowerCase().trim(),
          telephone: p.telephone || null,
          numero: nextNumero,
          evenementId: id,
        },
      });
      created.push(participant);
      nextNumero++;
    } catch {
      // Doublon email/evenement — on skip
      skipped.push(p.email);
    }
  }

  return NextResponse.json(
    {
      created: created.length,
      skipped: skipped.length,
      skippedEmails: skipped,
      participants: created,
    },
    { status: 201 }
  );
}

// PATCH /api/evenements/[id]/participants — mettre à jour la présence d'un participant
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({ where: { id } });
  if (!evenement || evenement.createurId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const { participantId, present } = body;

  if (!participantId || typeof present !== "boolean") {
    return NextResponse.json(
      { error: "participantId et present (boolean) sont requis" },
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

  const updated = await prisma.participant.update({
    where: { id: participantId },
    data: { present },
  });

  return NextResponse.json(updated);
}

// DELETE /api/evenements/[id]/participants — supprimer un participant
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({ where: { id } });
  if (!evenement || evenement.createurId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const { participantId } = body;

  if (!participantId) {
    return NextResponse.json({ error: "participantId requis" }, { status: 400 });
  }

  await prisma.participant.delete({ where: { id: participantId } });

  return NextResponse.json({ success: true });
}
