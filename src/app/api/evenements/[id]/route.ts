import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/evenements/[id] — détail d'un événement
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

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

  if (evenement.createurId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  return NextResponse.json(evenement);
}

// PATCH /api/evenements/[id] — modifier un événement
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.evenement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }
  if (existing.createurId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();

  const evenement = await prisma.evenement.update({
    where: { id },
    data: {
      ...(body.titre !== undefined && { titre: body.titre }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.messageFin !== undefined && { messageFin: body.messageFin }),
      ...(body.format !== undefined && { format: body.format }),
      ...(body.teamSize !== undefined && { teamSize: body.teamSize }),
      ...(body.date !== undefined && { date: new Date(body.date) }),
      ...(body.heureDebut !== undefined && { heureDebut: body.heureDebut }),
      ...(body.heureFin !== undefined && { heureFin: body.heureFin }),
      ...(body.tempsParoleTour !== undefined && { tempsParoleTour: body.tempsParoleTour }),
      ...(body.tempsPauseTour !== undefined && { tempsPauseTour: body.tempsPauseTour }),
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.evenement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }
  if (existing.createurId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.evenement.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
