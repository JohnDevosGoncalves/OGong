import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token } = parsed.data;

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Jeton de vérification invalide ou déjà utilisé." },
        { status: 400 }
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      // Supprimer le token expiré
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        { error: "Ce lien de vérification a expiré. Veuillez en demander un nouveau." },
        { status: 410 }
      );
    }

    // Marquer l'email comme vérifié et supprimer le token
    await prisma.$transaction([
      prisma.user.updateMany({
        where: { email: verificationToken.email },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return NextResponse.json({
      message: "Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.error("Erreur vérification email:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification." },
      { status: 500 }
    );
  }
}
