import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-utils";
import { repondreInvitationSchema } from "@/lib/validations";

// GET /api/compte/invitations — lister les invitations de l'utilisateur
export async function GET() {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  const invitations = await prisma.collaborateur.findMany({
    where: { userId },
    include: {
      evenement: {
        select: {
          id: true,
          titre: true,
          format: true,
          date: true,
          heureDebut: true,
          heureFin: true,
          status: true,
        },
      },
      inviteur: {
        select: { id: true, nom: true, prenom: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invitations);
}

// PATCH /api/compte/invitations — accepter ou refuser une invitation
export async function PATCH(request: Request) {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  try {
    const body = await request.json();

    const parsed = repondreInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { invitationId, action } = parsed.data;

    const invitation = await prisma.collaborateur.findFirst({
      where: { id: invitationId, userId },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation introuvable." },
        { status: 404 }
      );
    }

    if (invitation.accepte) {
      return NextResponse.json(
        { error: "Cette invitation a déjà été acceptée." },
        { status: 400 }
      );
    }

    if (action === "refuser") {
      await prisma.collaborateur.delete({ where: { id: invitationId } });
      return NextResponse.json({ success: true, message: "Invitation refusée." });
    }

    const updated = await prisma.collaborateur.update({
      where: { id: invitationId },
      data: { accepte: true },
      include: {
        evenement: { select: { id: true, titre: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur réponse invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de l'invitation." },
      { status: 500 }
    );
  }
}
