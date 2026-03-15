import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/inscription/[id] — infos publiques d'un événement (pas d'auth requise)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    select: {
      id: true,
      titre: true,
      description: true,
      format: true,
      date: true,
      heureDebut: true,
      heureFin: true,
      status: true,
      _count: { select: { participants: true } },
    },
  });

  if (!evenement) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  // Seuls les événements "ouvert" acceptent les inscriptions
  if (evenement.status !== "ouvert") {
    return NextResponse.json({
      ...evenement,
      inscriptionFermee: true,
    });
  }

  return NextResponse.json({
    ...evenement,
    inscriptionFermee: false,
  });
}

// POST /api/inscription/[id] — inscription publique d'un participant
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    select: { id: true, status: true, _count: { select: { participants: true } } },
  });

  if (!evenement) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  if (evenement.status !== "ouvert") {
    return NextResponse.json(
      { error: "Les inscriptions sont fermées pour cet événement." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { nom, prenom, email, telephone } = body;

  if (!nom || !prenom || !email) {
    return NextResponse.json(
      { error: "Nom, prénom et email sont requis." },
      { status: 400 }
    );
  }

  // Vérifier doublon
  const existing = await prisma.participant.findUnique({
    where: { email_evenementId: { email, evenementId: id } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Vous êtes déjà inscrit(e) à cet événement." },
      { status: 409 }
    );
  }

  // Attribuer un numéro
  const numero = evenement._count.participants + 1;

  const participant = await prisma.participant.create({
    data: {
      nom,
      prenom,
      email,
      telephone: telephone || null,
      numero,
      evenementId: id,
    },
  });

  return NextResponse.json({
    success: true,
    numero: participant.numero,
    message: `Inscription confirmée ! Votre numéro est le ${participant.numero}.`,
  });
}
