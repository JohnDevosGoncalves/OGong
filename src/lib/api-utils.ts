import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { userId: null as null, error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }) };
  }
  return { userId: session.user.id as string, error: null as null };
}

export async function getEventWithOwnership(eventId: string, userId: string) {
  const evenement = await prisma.evenement.findUnique({ where: { id: eventId } });
  if (!evenement) return { evenement: null, error: NextResponse.json({ error: "Événement introuvable" }, { status: 404 }) };
  if (evenement.createurId !== userId) return { evenement: null, error: NextResponse.json({ error: "Non autorisé" }, { status: 403 }) };
  return { evenement, error: null as null };
}

export async function getEventAccess(eventId: string, userId: string) {
  const evenement = await prisma.evenement.findUnique({ where: { id: eventId } });
  if (!evenement) {
    return { evenement: null as null, role: null as null, error: NextResponse.json({ error: "Événement introuvable" }, { status: 404 }) };
  }

  // Créateur = accès total
  if (evenement.createurId === userId) {
    return { evenement, role: "createur" as const, error: null as null };
  }

  // Collaborateur accepté
  const collab = await prisma.collaborateur.findUnique({
    where: { userId_evenementId: { userId, evenementId: eventId } },
  });

  if (collab && collab.accepte) {
    return { evenement, role: collab.role as "co_organisateur" | "animateur", error: null as null };
  }

  return { evenement: null as null, role: null as null, error: NextResponse.json({ error: "Non autorisé" }, { status: 403 }) };
}

export function sanitize(str: string): string {
  return str.trim().replace(/<[^>]*>/g, "").slice(0, 500);
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254);
}
