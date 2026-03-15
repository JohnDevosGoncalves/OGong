import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitize, sanitizeEmail } from "@/lib/api-utils";
import { inscriptionSchema } from "@/lib/validations";
import { sendInscriptionConfirmation } from "@/lib/email";

// GET /api/inscription/[id] — infos publiques d'un événement (pas d'auth requise)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    select: {
      id: true,
      titre: true,
      description: true,
      format: true,
      date: true,
      heureDebut: true,
      heureFin: true,
      status: true,
      _count: { select: { participants: true } },
    },
  });

  if (!evenement) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  // Seuls les événements "ouvert" acceptent les inscriptions
  if (evenement.status !== "ouvert") {
    return NextResponse.json({
      ...evenement,
      inscriptionFermee: true,
    });
  }

  return NextResponse.json({
    ...evenement,
    inscriptionFermee: false,
  });
}

// POST /api/inscription/[id] — inscription publique d'un participant
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    select: {
      id: true,
      titre: true,
      date: true,
      heureDebut: true,
      heureFin: true,
      format: true,
      status: true,
      _count: { select: { participants: true } },
    },
  });

  if (!evenement) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  if (evenement.status !== "ouvert") {
    return NextResponse.json(
      { error: "Les inscriptions sont fermées pour cet événement." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const parsed = inscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { nom, prenom, email, telephone } = parsed.data;

    const sanitizedNom = sanitize(nom);
    const sanitizedPrenom = sanitize(prenom);
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedTelephone = telephone ? sanitize(telephone) : null;

    // Vérifier doublon
    const existing = await prisma.participant.findUnique({
      where: { email_evenementId: { email: sanitizedEmail, evenementId: id } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Vous êtes déjà inscrit(e) à cet événement." },
        { status: 409 }
      );
    }

    // Attribuer un numéro
    const lastParticipant = await prisma.participant.findFirst({
      where: { evenementId: id },
      orderBy: { numero: "desc" },
    });
    const numero = (lastParticipant?.numero ?? 0) + 1;

    const participant = await prisma.participant.create({
      data: {
        nom: sanitizedNom,
        prenom: sanitizedPrenom,
        email: sanitizedEmail,
        telephone: sanitizedTelephone,
        numero,
        evenementId: id,
      },
    });

    // Envoyer l'email de confirmation (ne bloque pas l'inscription en cas d'erreur)
    try {
      await sendInscriptionConfirmation(sanitizedEmail, sanitizedPrenom, {
        titre: evenement.titre,
        date: evenement.date,
        heureDebut: evenement.heureDebut,
        heureFin: evenement.heureFin,
        format: evenement.format,
        numero: participant.numero!,
      });
    } catch (emailError) {
      console.error("Erreur envoi email de confirmation:", emailError);
    }

    return NextResponse.json({
      success: true,
      numero: participant.numero,
      message: `Inscription confirmée ! Votre numéro est le ${participant.numero}.`,
    });
  } catch (error) {
    console.error("Erreur inscription publique:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}
