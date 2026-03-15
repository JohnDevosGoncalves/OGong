import Stripe from "stripe";
import prisma from "@/lib/prisma";

// ─── Lazy init (comme Resend dans email.ts) ─────────────────

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("La variable d'environnement STRIPE_SECRET_KEY est requise");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

export { getStripe };

// ─── Packs de crédits ───────────────────────────────────────

export const CREDIT_PACKS = [
  { id: "pack_10", credits: 10, prix: 9.99, label: "10 crédits", populaire: false },
  { id: "pack_25", credits: 25, prix: 19.99, label: "25 crédits", populaire: true },
  { id: "pack_50", credits: 50, prix: 34.99, label: "50 crédits", populaire: false },
  { id: "pack_100", credits: 100, prix: 59.99, label: "100 crédits", populaire: false },
] as const;

export type CreditPackId = (typeof CREDIT_PACKS)[number]["id"];

// ─── Créer une session Stripe Checkout ──────────────────────

export async function createCheckoutSession(
  userId: string,
  packId: string,
  successUrl: string,
  cancelUrl: string
) {
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) {
    throw new Error("Pack de crédits introuvable");
  }

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: pack.label,
            description: `Achat de ${pack.credits} crédits OGong`,
          },
          unit_amount: Math.round(pack.prix * 100), // en centimes
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      packId: pack.id,
      credits: String(pack.credits),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  // Créer l'enregistrement de paiement en attente
  await prisma.paiement.create({
    data: {
      userId,
      stripeSessionId: session.id,
      montantEuros: pack.prix,
      credits: pack.credits,
      status: "en_attente",
    },
  });

  return session;
}

// ─── Solde de crédits d'un utilisateur ──────────────────────

export async function getUserCredits(userId: string): Promise<number> {
  const result = await prisma.credit.aggregate({
    where: { userId },
    _sum: { montant: true },
  });

  return result._sum.montant ?? 0;
}
