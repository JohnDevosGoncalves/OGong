import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-utils";

export async function GET() {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const eventCount = await prisma.evenement.count({
    where: { createurId: userId },
  });

  let participantCount = 0;
  let tourCount = 0;

  if (eventCount > 0) {
    participantCount = await prisma.participant.count({
      where: { evenement: { createurId: userId } },
    });

    tourCount = await prisma.tour.count({
      where: { evenement: { createurId: userId } },
    });
  }

  return NextResponse.json({
    emailVerifie: user.emailVerified !== null,
    premierEvenement: eventCount > 0,
    premiersParticipants: participantCount > 0,
    premierTour: tourCount > 0,
  });
}
