import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-utils";
import { buyCreditsSchema } from "@/lib/validations";
import { createCheckoutSession, getUserCredits } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// GET /api/credits — solde et historique des crédits
export async function GET() {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  const [solde, historique] = await Promise.all([
    getUserCredits(userId),
    prisma.credit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({ solde, historique });
}

// POST /api/credits — créer une session Stripe Checkout
export async function POST(request: Request) {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  try {
    const body = await request.json();

    const parsed = buyCreditsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { packId } = parsed.data;

    const session = await createCheckoutSession(
      userId,
      packId,
      `${APP_URL}/credits?success=true`,
      `${APP_URL}/credits?cancelled=true`
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Erreur création session Stripe:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement." },
      { status: 500 }
    );
  }
}
