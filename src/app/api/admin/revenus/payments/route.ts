import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/api-utils";

// GET /api/admin/revenus/payments — historique de tous les paiements
export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const payments = await prisma.paiement.findMany({
    select: {
      id: true,
      montantEuros: true,
      credits: true,
      status: true,
      createdAt: true,
      user: {
        select: { nom: true, prenom: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ payments });
}
