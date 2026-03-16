import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/api-utils";
import { adminSearchSchema } from "@/lib/validations";

// GET /api/admin/events — lister tous les événements de la plateforme
export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const url = request.nextUrl;
  const parsed = adminSearchSchema.safeParse({
    search: url.searchParams.get("search") || undefined,
    status: url.searchParams.get("status") || undefined,
    format: url.searchParams.get("format") || undefined,
    page: url.searchParams.get("page") || 1,
    limit: url.searchParams.get("limit") || 20,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { search, status, format, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { titre: { contains: search, mode: "insensitive" } },
      { createur: { nom: { contains: search, mode: "insensitive" } } },
      { createur: { prenom: { contains: search, mode: "insensitive" } } },
      { createur: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (format) {
    where.format = format;
  }

  const [events, total] = await Promise.all([
    prisma.evenement.findMany({
      where,
      select: {
        id: true,
        titre: true,
        format: true,
        date: true,
        status: true,
        createdAt: true,
        createur: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.evenement.count({ where }),
  ]);

  const eventsFormatted = events.map((e) => ({
    id: e.id,
    titre: e.titre,
    format: e.format,
    date: e.date,
    status: e.status,
    createdAt: e.createdAt,
    createur: e.createur,
    participants: e._count.participants,
  }));

  return NextResponse.json({
    events: eventsFormatted,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// DELETE /api/admin/events — supprimer un événement (modération)
export async function DELETE(request: Request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await request.json();
  const { eventId } = body;

  if (!eventId) {
    return NextResponse.json({ error: "Identifiant d'événement requis" }, { status: 400 });
  }

  const event = await prisma.evenement.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  // Cascade delete handles participants, tours, tables, etc.
  await prisma.evenement.delete({ where: { id: eventId } });

  return NextResponse.json({ success: true, message: "Événement supprimé avec succès" });
}
