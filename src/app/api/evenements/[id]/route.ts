import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, getEventWithOwnership, sanitize } from "@/lib/api-utils";
import { updateEventSchema } from "@/lib/validations";

// GET /api/evenements/[id] — détail d'un événement
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    include: {
      participants: { orderBy: { createdAt: "asc" } },
      tours: { orderBy: { numero: "asc" } },
      tables: { orderBy: { numero: "asc" } },
      _count: { select: { participants: true } },
    },
  });

  if (!evenement) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  if (evenement.createurId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  return NextResponse.json(evenement);
}

// PATCH /api/evenements/[id] — modifier un événement
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

  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const evenement = await prisma.evenement.update({
    where: { id },
    data: {
      ...(data.titre !== undefined && { titre: sanitize(data.titre) }),
      ...(data.description !== undefined && { description: data.description ? sanitize(data.description) : null }),
      ...(data.messageFin !== undefined && { messageFin: data.messageFin ? sanitize(data.messageFin) : null }),
      ...(data.format !== undefined && { format: data.format }),
      ...(data.teamSize !== undefined && { teamSize: data.teamSize }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.heureDebut !== undefined && { heureDebut: data.heureDebut }),
      ...(data.heureFin !== undefined && { heureFin: data.heureFin }),
      ...(data.tempsParoleTour !== undefined && { tempsParoleTour: data.tempsParoleTour }),
      ...(data.tempsPauseTour !== undefined && { tempsPauseTour: data.tempsPauseTour }),
      ...(body.debutPause !== undefined && { debutPause: body.debutPause }),
      ...(body.finPause !== undefined && { finPause: body.finPause }),
      ...(body.status !== undefined && { status: body.status }),
    },
  });

  return NextResponse.json(evenement);
}

// DELETE /api/evenements/[id] — supprimer un événement
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  await prisma.evenement.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
