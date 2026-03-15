import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sanitizeEmail } from "@/lib/api-utils";
import { resendVerificationSchema } from "@/lib/validations";
import { sendEmailVerification } from "@/lib/email";

const MAX_RESEND_PER_HOUR = 3;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = resendVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = sanitizeEmail(parsed.data.email);

    // Toujours retourner succès pour ne pas divulguer l'existence d'un compte
    const successResponse = NextResponse.json({
      message: "Si un compte non vérifié existe avec cet email, un nouveau lien de vérification a été envoyé.",
    });

    // Vérifier le rate limit : max 3 tokens par email par heure
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentTokens = await prisma.emailVerificationToken.count({
      where: {
        email,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentTokens >= MAX_RESEND_PER_HOUR) {
      // Rate limit atteint, retourner succès sans envoyer
      return successResponse;
    }

    // Chercher un utilisateur non vérifié
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, prenom: true, emailVerified: true },
    });

    if (!user || user.emailVerified) {
      return successResponse;
    }

    // Supprimer les anciens tokens pour cet email
    await prisma.emailVerificationToken.deleteMany({
      where: { email },
    });

    // Créer un nouveau token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

    await prisma.emailVerificationToken.create({
      data: { token, email, expiresAt },
    });

    try {
      await sendEmailVerification(email, user.prenom, token);
    } catch (emailError) {
      console.error("Erreur renvoi email de vérification:", emailError);
    }

    return successResponse;
  } catch (error) {
    console.error("Erreur renvoi vérification:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
