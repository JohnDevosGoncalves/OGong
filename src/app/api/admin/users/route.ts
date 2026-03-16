import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/api-utils";
import { updateUserRoleSchema, adminSearchSchema } from "@/lib/validations";

// GET /api/admin/users — lister tous les utilisateurs
export async function GET(request: NextRequest) {
  const { userId, error } = await requireSuperAdmin();
  if (error) return error;

  const url = request.nextUrl;
  const parsed = adminSearchSchema.safeParse({
    search: url.searchParams.get("search") || undefined,
    role: url.searchParams.get("role") || undefined,
    page: url.searchParams.get("page") || 1,
    limit: url.searchParams.get("limit") || 20,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { search, role, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { nom: { contains: search, mode: "insensitive" } },
      { prenom: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            evenements: true,
            credits: true,
          },
        },
        credits: {
          select: { montant: true, type: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Calculer le solde de crédits pour chaque utilisateur
  const usersWithBalance = users.map((user) => {
    const soldeCredits = user.credits.reduce((acc, c) => {
      if (c.type === "achat" || c.type === "bonus") return acc + c.montant;
      if (c.type === "utilisation") return acc - c.montant;
      return acc;
    }, 0);

    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      evenements: user._count.evenements,
      soldeCredits,
    };
  });

  return NextResponse.json({
    users: usersWithBalance,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    currentUserId: userId,
  });
}

// PATCH /api/admin/users — modifier le rôle d'un utilisateur
export async function PATCH(request: Request) {
  const { userId, error } = await requireSuperAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = updateUserRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { userId: targetUserId, role } = parsed.data;

  // Empêcher de modifier son propre rôle
  if (targetUserId === userId) {
    return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre rôle" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role },
    select: { id: true, nom: true, prenom: true, email: true, role: true },
  });

  return NextResponse.json(updated);
}

// DELETE /api/admin/users — supprimer un utilisateur et toutes ses données
export async function DELETE(request: Request) {
  const { userId, error } = await requireSuperAdmin();
  if (error) return error;

  const body = await request.json();
  const { targetUserId } = body;

  if (!targetUserId) {
    return NextResponse.json({ error: "Identifiant utilisateur requis" }, { status: 400 });
  }

  // Empêcher de se supprimer soi-même
  if (targetUserId === userId) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte depuis l'admin" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Supprimer toutes les données dans une transaction
  await prisma.$transaction(async (tx) => {
    await tx.collaborateur.deleteMany({ where: { userId: targetUserId } });
    await tx.collaborateur.deleteMany({ where: { invitePar: targetUserId } });
    await tx.evenement.deleteMany({ where: { createurId: targetUserId } });
    await tx.credit.deleteMany({ where: { userId: targetUserId } });
    await tx.paiement.deleteMany({ where: { userId: targetUserId } });
    await tx.passwordResetToken.deleteMany({ where: { email: targetUser.email } });
    await tx.user.delete({ where: { id: targetUserId } });
  });

  return NextResponse.json({ success: true, message: "Utilisateur supprimé avec succès" });
}
