import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, getEventWithOwnership, sanitize } from "@/lib/api-utils";
import { addExposantSchema } from "@/lib/validations";

// GET /api/evenements/[id]/exposants — liste des exposants avec créneaux et inscriptions
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  const exposants = await prisma.exposant.findMany({
    where: { evenementId: id },
    include: {
      societe: true,
      creneaux: {
        orderBy: { heureDebut: "asc" },
        include: {
          _count: { select: { inscriptions: true } },
        },
      },
    },
    orderBy: { societe: { nom: "asc" } },
  });

  return NextResponse.json(exposants);
}

// POST /api/evenements/[id]/exposants — ajouter un exposant
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
  const parsed = addExposantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { nom, entreprise, description } = parsed.data;
  const societeNom = sanitize(entreprise || nom);

  // Trouver ou créer la société
  let societe = await prisma.societe.findFirst({
    where: { nom: societeNom },
  });

  if (!societe) {
    societe = await prisma.societe.create({
      data: {
        nom: societeNom,
        adresse: description ? sanitize(description) : null,
      },
    });
  }

  // Vérifier que l'exposant n'existe pas déjà pour cet événement
  const existing = await prisma.exposant.findUnique({
    where: { societeId_evenementId: { societeId: societe.id, evenementId: id } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Cet exposant est déjà inscrit à cet événement." },
      { status: 409 }
    );
  }

  const exposant = await prisma.exposant.create({
    data: {
      societeId: societe.id,
      evenementId: id,
    },
    include: {
      societe: true,
      creneaux: true,
    },
  });

  return NextResponse.json(exposant, { status: 201 });
}

// DELETE /api/evenements/[id]/exposants — supprimer un exposant
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
  const exposantId = searchParams.get("exposantId");

  if (!exposantId) {
    return NextResponse.json({ error: "exposantId requis" }, { status: 400 });
  }

  // Vérifier que l'exposant appartient à cet événement
  const exposant = await prisma.exposant.findFirst({
    where: { id: exposantId, evenementId: id },
  });

  if (!exposant) {
    return NextResponse.json(
      { error: "Exposant introuvable pour cet événement" },
      { status: 404 }
    );
  }

  await prisma.exposant.delete({ where: { id: exposantId } });

  return NextResponse.json({ success: true });
}
