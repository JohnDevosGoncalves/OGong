import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sanitize, sanitizeEmail } from "@/lib/api-utils";
import { registerSchema } from "@/lib/validations";
import { WELCOME_CREDITS } from "@/lib/stripe";
import { sendEmailVerification } from "@/lib/email";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { nom, prenom, email, telephone, password } = parsed.data;

    const sanitizedNom = sanitize(nom);
    const sanitizedPrenom = sanitize(prenom);
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedTelephone = telephone ? sanitize(telephone) : null;

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur et les crédits de bienvenue en une transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          nom: sanitizedNom,
          prenom: sanitizedPrenom,
          email: sanitizedEmail,
          telephone: sanitizedTelephone,
          hashedPassword,
          role: "admin",
        },
      });

      await tx.credit.create({
        data: {
          userId: newUser.id,
          montant: WELCOME_CREDITS,
          type: "bonus",
          detail: "Crédits de bienvenue",
        },
      });

      return newUser;
    });

    // Générer et stocker le token de vérification d'email
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

    await prisma.emailVerificationToken.create({
      data: {
        token: verificationToken,
        email: sanitizedEmail,
        expiresAt,
      },
    });

    // Envoyer l'email de vérification (ne bloque pas l'inscription)
    try {
      await sendEmailVerification(sanitizedEmail, sanitizedPrenom, verificationToken);
    } catch (emailError) {
      console.error("Erreur envoi email de vérification:", emailError);
    }

    return NextResponse.json(
      {
        message: "Compte créé avec succès. Vérifiez votre boîte mail pour activer votre compte.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
