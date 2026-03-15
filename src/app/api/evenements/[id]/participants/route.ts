import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, getEventWithOwnership, sanitize, sanitizeEmail } from "@/lib/api-utils";
import { addParticipantSchema, bulkParticipantsSchema } from "@/lib/validations";

// GET /api/evenements/[id]/participants — liste des participants
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
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(participants);
}

// POST /api/evenements/[id]/participants — ajouter un ou plusieurs participants
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

  // Support ajout unique ou bulk (CSV)
  const isBulk = Array.isArray(body);
  const parsed = isBulk
    ? bulkParticipantsSchema.safeParse(body)
    : addParticipantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const participantsData = isBulk
    ? (parsed.data as Array<{ nom: string; prenom: string; email: string; telephone?: string | null }>)
    : [parsed.data as { nom: string; prenom: string; email: string; telephone?: string | null }];

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
          nom: sanitize(p.nom),
          prenom: sanitize(p.prenom),
          email: sanitizeEmail(p.email),
          telephone: p.telephone ? sanitize(p.telephone) : null,
          numero: nextNumero,
          evenementId: id,
        },
      });
      created.push(participant);
      nextNumero++;
    } catch (error) {
      // Doublon email/evenement — on skip
      console.error("Erreur ajout participant (doublon probable):", error);
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
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

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
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  const body = await request.json();
  const { participantId } = body;

  if (!participantId) {
    return NextResponse.json({ error: "participantId requis" }, { status: 400 });
  }

  await prisma.participant.delete({ where: { id: participantId } });

  return NextResponse.json({ success: true });
}
