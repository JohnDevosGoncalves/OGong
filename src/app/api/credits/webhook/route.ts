import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { CREDIT_PACKS } from "@/lib/stripe";
import prisma from "@/lib/prisma";

// POST /api/credits/webhook — Stripe webhook handler
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET non configuré");
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Erreur vérification signature webhook:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, packId, credits } = session.metadata ?? {};

    if (!userId || !packId || !credits) {
      console.error("Metadata manquantes dans la session Stripe:", session.id);
      return NextResponse.json({ error: "Metadata manquantes" }, { status: 400 });
    }

    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) {
      console.error("Pack introuvable:", packId);
      return NextResponse.json({ error: "Pack introuvable" }, { status: 400 });
    }

    const nbCredits = parseInt(credits, 10);

    try {
      await prisma.$transaction([
        // Mettre à jour le paiement
        prisma.paiement.update({
          where: { stripeSessionId: session.id },
          data: { status: "complete" },
        }),
        // Créditer l'utilisateur
        prisma.credit.create({
          data: {
            userId,
            montant: nbCredits,
            type: "achat",
            detail: `Achat ${pack.label} — ${pack.prix} €`,
          },
        }),
      ]);
    } catch (err) {
      console.error("Erreur traitement webhook:", err);
      return NextResponse.json({ error: "Erreur traitement" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
