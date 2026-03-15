import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, getEventWithOwnership, sanitizeEmail } from "@/lib/api-utils";
import { inviteCollaborateurSchema } from "@/lib/validations";

// GET /api/evenements/[id]/collaborateurs — lister les collaborateurs
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  const collaborateurs = await prisma.collaborateur.findMany({
    where: { evenementId: id },
    include: {
      user: { select: { id: true, nom: true, prenom: true, email: true } },
      inviteur: { select: { id: true, nom: true, prenom: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(collaborateurs);
}

// POST /api/evenements/[id]/collaborateurs — inviter un collaborateur
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  try {
    const body = await request.json();

    const parsed = inviteCollaborateurSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = sanitizeEmail(parsed.data.email);
    const { role } = parsed.data;

    // Vérifier que l'utilisateur existe
    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) {
      return NextResponse.json(
        { error: "Aucun utilisateur trouvé avec cet email. L'utilisateur doit d'abord créer un compte." },
        { status: 404 }
      );
    }

    // Empêcher de s'inviter soi-même
    if (invitedUser.id === userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous inviter vous-même." },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'est pas déjà invité
    const existing = await prisma.collaborateur.findUnique({
      where: { userId_evenementId: { userId: invitedUser.id, evenementId: id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Cet utilisateur est déjà invité pour cet événement." },
        { status: 409 }
      );
    }

    const collaborateur = await prisma.collaborateur.create({
      data: {
        role,
        userId: invitedUser.id,
        evenementId: id,
        invitePar: userId,
      },
      include: {
        user: { select: { id: true, nom: true, prenom: true, email: true } },
        inviteur: { select: { id: true, nom: true, prenom: true } },
      },
    });

    return NextResponse.json(collaborateur, { status: 201 });
  } catch (error) {
    console.error("Erreur invitation collaborateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'invitation du collaborateur." },
      { status: 500 }
    );
  }
}

// DELETE /api/evenements/[id]/collaborateurs — supprimer un collaborateur
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
  const collaborateurId = searchParams.get("collaborateurId");

  if (!collaborateurId) {
    return NextResponse.json(
      { error: "Identifiant du collaborateur requis." },
      { status: 400 }
    );
  }

  const collab = await prisma.collaborateur.findFirst({
    where: { id: collaborateurId, evenementId: id },
  });

  if (!collab) {
    return NextResponse.json(
      { error: "Collaborateur introuvable." },
      { status: 404 }
    );
  }

  await prisma.collaborateur.delete({ where: { id: collaborateurId } });

  return NextResponse.json({ success: true });
}

// PATCH /api/evenements/[id]/collaborateurs — accepter/refuser une invitation
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    const { action } = body;

    if (action !== "accepter" && action !== "refuser") {
      return NextResponse.json(
        { error: "L'action doit être accepter ou refuser." },
        { status: 400 }
      );
    }

    const collab = await prisma.collaborateur.findUnique({
      where: { userId_evenementId: { userId, evenementId: id } },
    });

    if (!collab) {
      return NextResponse.json(
        { error: "Invitation introuvable." },
        { status: 404 }
      );
    }

    if (collab.accepte) {
      return NextResponse.json(
        { error: "Cette invitation a déjà été acceptée." },
        { status: 400 }
      );
    }

    if (action === "refuser") {
      await prisma.collaborateur.delete({ where: { id: collab.id } });
      return NextResponse.json({ success: true, message: "Invitation refusée." });
    }

    const updated = await prisma.collaborateur.update({
      where: { id: collab.id },
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
