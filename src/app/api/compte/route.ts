import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getAuthSession, sanitize, sanitizeEmail } from "@/lib/api-utils";
import { updateAccountSchema, changePasswordSchema, deleteAccountSchema } from "@/lib/validations";

// GET /api/compte — récupérer les infos du compte
export async function GET() {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      role: true,
      createdAt: true,
      societe: { select: { id: true, nom: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH /api/compte — modifier les infos du compte
export async function PATCH(request: Request) {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  const body = await request.json();

  const parsed = updateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Vérifier si l'email est déjà pris (si modifié)
  if (data.email) {
    const sanitizedNewEmail = sanitizeEmail(data.email);
    const existing = await prisma.user.findFirst({
      where: { email: sanitizedNewEmail, NOT: { id: userId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.nom !== undefined && { nom: sanitize(data.nom) }),
      ...(data.prenom !== undefined && { prenom: sanitize(data.prenom) }),
      ...(data.telephone !== undefined && { telephone: data.telephone ? sanitize(data.telephone) : null }),
      ...(data.email !== undefined && { email: sanitizeEmail(data.email) }),
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      role: true,
    },
  });

  return NextResponse.json(user);
}

// PUT /api/compte — changer le mot de passe
export async function PUT(request: Request) {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  const body = await request.json();

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!isValid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 403 });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { hashedPassword: hashed },
  });

  return NextResponse.json({ success: true });
}

// DELETE /api/compte — supprimer le compte et toutes les données
export async function DELETE(request: Request) {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  const body = await request.json();

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 403 });
  }

  // Supprimer toutes les données dans une transaction
  await prisma.$transaction(async (tx) => {
    // Supprimer les collaborations (en tant qu'utilisateur et inviteur)
    await tx.collaborateur.deleteMany({ where: { userId } });
    await tx.collaborateur.deleteMany({ where: { invitePar: userId } });

    // Supprimer tous les événements créés (cascade : participants, tours, tables, affectations, exposants, créneaux)
    await tx.evenement.deleteMany({ where: { createurId: userId } });

    // Supprimer les crédits et paiements
    await tx.credit.deleteMany({ where: { userId } });
    await tx.paiement.deleteMany({ where: { userId } });

    // Supprimer les jetons de réinitialisation de mot de passe
    await tx.passwordResetToken.deleteMany({ where: { email: user.email } });

    // Supprimer le compte utilisateur (cascade : sessions, accounts)
    await tx.user.delete({ where: { id: userId } });
  });

  return NextResponse.json({
    success: true,
    message: "Votre compte a été supprimé.",
  });
}
