import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, getEventWithOwnership } from "@/lib/api-utils";
import { sendNotificationSchema } from "@/lib/validations";
import {
  sendEventReminder,
  sendEventStartNotification,
  sendEventResults,
  sendEmailsInBatches,
  type EvenementEmailData,
  type EventResultsStats,
} from "@/lib/email";

// POST /api/evenements/[id]/notifications — envoyer des notifications aux participants
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { id } = await params;

  const { evenement, error: ownerError } = await getEventWithOwnership(id, userId);
  if (ownerError) return ownerError;

  const body = await request.json();

  const parsed = sendNotificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { type } = parsed.data;

  // Récupérer tous les participants avec email
  const participants = await prisma.participant.findMany({
    where: { evenementId: id, email: { not: "" } },
    select: { email: true, prenom: true },
  });

  if (participants.length === 0) {
    return NextResponse.json(
      { error: "Aucun participant avec une adresse email." },
      { status: 400 }
    );
  }

  const evenementData: EvenementEmailData = {
    titre: evenement!.titre,
    date: evenement!.date,
    heureDebut: evenement!.heureDebut,
    heureFin: evenement!.heureFin,
    format: evenement!.format,
  };

  let result: { sent: number; failed: number };

  switch (type) {
    case "reminder": {
      result = await sendEmailsInBatches(participants, (p) =>
        sendEventReminder(p.email, p.prenom, evenementData)
      );
      break;
    }
    case "start": {
      result = await sendEmailsInBatches(participants, (p) =>
        sendEventStartNotification(p.email, p.prenom, evenementData)
      );
      break;
    }
    case "results": {
      // Récupérer les stats pour l'email de résultats
      const [toursCount, affectationsCount] = await Promise.all([
        prisma.tour.count({ where: { evenementId: id } }),
        prisma.affectationTable.count({
          where: { tour: { evenementId: id } },
        }),
      ]);

      const stats: EventResultsStats = {
        nbTours: toursCount,
        nbParticipants: participants.length,
        nbRencontres: affectationsCount,
      };

      result = await sendEmailsInBatches(participants, (p) =>
        sendEventResults(p.email, p.prenom, evenementData, stats)
      );
      break;
    }
  }

  return NextResponse.json({
    success: true,
    sent: result.sent,
    failed: result.failed,
    total: participants.length,
  });
}
