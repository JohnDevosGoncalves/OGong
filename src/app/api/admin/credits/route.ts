import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/api-utils";
import { grantCreditsSchema } from "@/lib/validations";

// POST /api/admin/credits — attribuer des crédits bonus à un utilisateur
export async function POST(request: Request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = grantCreditsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { userId, montant, detail } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const credit = await prisma.credit.create({
    data: {
      userId,
      montant,
      type: "bonus",
      detail,
    },
  });

  return NextResponse.json({
    success: true,
    credit,
    message: `${montant} crédit(s) bonus attribué(s) à ${user.prenom} ${user.nom}`,
  });
}
