import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/compte — récupérer les infos du compte
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();

  // Vérifier si l'email est déjà pris (si modifié)
  if (body.email) {
    const existing = await prisma.user.findFirst({
      where: { email: body.email, NOT: { id: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(body.nom !== undefined && { nom: body.nom }),
      ...(body.prenom !== undefined && { prenom: body.prenom }),
      ...(body.telephone !== undefined && { telephone: body.telephone || null }),
      ...(body.email !== undefined && { email: body.email }),
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.currentPassword || !body.newPassword) {
    return NextResponse.json(
      { error: "Mot de passe actuel et nouveau requis." },
      { status: 400 }
    );
  }

  if (body.newPassword.length < 6) {
    return NextResponse.json(
      { error: "Le nouveau mot de passe doit faire au moins 6 caractères." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(body.currentPassword, user.hashedPassword);
  if (!isValid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 403 });
  }

  const hashed = await bcrypt.hash(body.newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { hashedPassword: hashed },
  });

  return NextResponse.json({ success: true });
}
