import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sanitize, sanitizeEmail } from "@/lib/api-utils";
import { registerSchema } from "@/lib/validations";

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

    const user = await prisma.user.create({
      data: {
        nom: sanitizedNom,
        prenom: sanitizedPrenom,
        email: sanitizedEmail,
        telephone: sanitizedTelephone,
        hashedPassword,
        role: "admin",
      },
    });

    return NextResponse.json(
      { message: "Compte créé avec succès.", userId: user.id },
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
