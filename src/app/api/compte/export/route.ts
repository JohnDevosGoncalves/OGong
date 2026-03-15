import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-utils";

// GET /api/compte/export — exporter toutes les données personnelles (RGPD)
export async function GET() {
  const { userId, error } = await getAuthSession();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      role: true,
      createdAt: true,
      societe: { select: { id: true, nom: true, adresse: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const [evenements, collaborations, credits, paiements] = await Promise.all([
    prisma.evenement.findMany({
      where: { createurId: userId },
      include: {
        participants: {
          select: {
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            numero: true,
            present: true,
            createdAt: true,
          },
        },
        tours: {
          select: {
            numero: true,
            status: true,
            affectations: {
              select: {
                participantId: true,
                tableId: true,
              },
            },
          },
        },
        tables: {
          select: { id: true, numero: true },
        },
        exposants: {
          select: {
            id: true,
            societe: { select: { nom: true } },
            creneaux: {
              select: {
                heureDebut: true,
                heureFin: true,
                maxParticipants: true,
                inscriptions: {
                  select: {
                    participantId: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    }),

    prisma.collaborateur.findMany({
      where: { userId },
      select: {
        role: true,
        accepte: true,
        createdAt: true,
        evenement: { select: { id: true, titre: true, date: true } },
        inviteur: { select: { nom: true, prenom: true, email: true } },
      },
    }),

    prisma.credit.findMany({
      where: { userId },
      select: {
        montant: true,
        type: true,
        detail: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.paiement.findMany({
      where: { userId },
      select: {
        montantEuros: true,
        credits: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const exportData = {
    exportDate: new Date().toISOString(),
    utilisateur: user,
    evenements: evenements.map((evt) => ({
      titre: evt.titre,
      description: evt.description,
      format: evt.format,
      date: evt.date,
      heureDebut: evt.heureDebut,
      heureFin: evt.heureFin,
      status: evt.status,
      createdAt: evt.createdAt,
      participants: evt.participants,
      tours: evt.tours,
      tables: evt.tables,
      exposants: evt.exposants,
    })),
    collaborations,
    credits,
    paiements,
  };

  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `ogong-donnees-${userId}-${dateStr}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
