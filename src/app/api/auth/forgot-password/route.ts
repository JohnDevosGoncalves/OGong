import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sanitizeEmail } from "@/lib/api-utils";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/email";

const SUCCESS_MESSAGE =
  "Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = sanitizeEmail(parsed.data.email);

    // Rate limit: max 3 tokens per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await prisma.passwordResetToken.count({
      where: {
        email,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentTokens >= 3) {
      // Always return success to avoid leaking info
      return NextResponse.json({ message: SUCCESS_MESSAGE });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't leak whether the account exists
      return NextResponse.json({ message: SUCCESS_MESSAGE });
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, email, expiresAt },
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: SUCCESS_MESSAGE });
  } catch (error) {
    console.error("Erreur mot de passe oublié:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
