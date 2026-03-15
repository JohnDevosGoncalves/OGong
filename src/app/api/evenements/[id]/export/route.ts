import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const BOM = "\uFEFF";
const SEP = ";";

function csvLine(fields: (string | number | boolean | null | undefined)[]): string {
  return fields
    .map((f) => {
      const val = f === null || f === undefined ? "" : String(f);
      // Escape quotes and wrap in quotes if contains separator, quotes, or newlines
      if (val.includes(SEP) || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    })
    .join(SEP);
}

function csvResponse(filename: string, lines: string[]): Response {
  const body = BOM + lines.join("\r\n") + "\r\n";
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

// GET /api/evenements/[id]/export?type=participants|resultats|rencontres
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    select: { id: true, titre: true, createurId: true },
  });

  if (!evenement) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  if (evenement.createurId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  const safeTitle = evenement.titre.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ _-]/g, "").slice(0, 40);

  // ── Export participants ──────────────────────────────────
  if (type === "participants") {
    const participants = await prisma.participant.findMany({
      where: { evenementId: id },
      orderBy: { numero: "asc" },
    });

    const lines = [
      csvLine(["Numéro", "Nom", "Prénom", "Email", "Téléphone", "Présent"]),
      ...participants.map((p) =>
        csvLine([p.numero, p.nom, p.prenom, p.email, p.telephone, p.present ? "Oui" : "Non"])
      ),
    ];

    return csvResponse(`${safeTitle}_participants.csv`, lines);
  }

  // ── Export résultats par tour ────────────────────────────
  if (type === "resultats") {
    const tours = await prisma.tour.findMany({
      where: { evenementId: id },
      orderBy: { numero: "asc" },
      include: {
        affectations: {
          include: {
            participant: true,
            table: true,
          },
          orderBy: { table: { numero: "asc" } },
        },
      },
    });

    const lines = [csvLine(["Tour", "Table", "Nom", "Prénom", "Numéro"])];

    for (const tour of tours) {
      for (const aff of tour.affectations) {
        lines.push(
          csvLine([
            tour.numero,
            aff.table.numero,
            aff.participant.nom,
            aff.participant.prenom,
            aff.participant.numero,
          ])
        );
      }
    }

    return csvResponse(`${safeTitle}_resultats.csv`, lines);
  }

  // ── Export rencontres (pairings uniques) ─────────────────
  if (type === "rencontres") {
    const tours = await prisma.tour.findMany({
      where: { evenementId: id },
      orderBy: { numero: "asc" },
      include: {
        affectations: {
          include: {
            participant: true,
            table: true,
          },
        },
      },
    });

    const lines = [csvLine(["Participant 1", "Participant 2", "Tour", "Table"])];

    for (const tour of tours) {
      // Group affectations by table
      const byTable = new Map<string, typeof tour.affectations>();
      for (const aff of tour.affectations) {
        const key = aff.tableId;
        if (!byTable.has(key)) byTable.set(key, []);
        byTable.get(key)!.push(aff);
      }

      // For each table, generate all pairs
      for (const [, affs] of byTable) {
        const sorted = affs.sort((a, b) => (a.participant.numero ?? 0) - (b.participant.numero ?? 0));
        for (let i = 0; i < sorted.length; i++) {
          for (let j = i + 1; j < sorted.length; j++) {
            const p1 = sorted[i].participant;
            const p2 = sorted[j].participant;
            lines.push(
              csvLine([
                `${p1.prenom} ${p1.nom}`,
                `${p2.prenom} ${p2.nom}`,
                tour.numero,
                sorted[i].table.numero,
              ])
            );
          }
        }
      }
    }

    return csvResponse(`${safeTitle}_rencontres.csv`, lines);
  }

  return NextResponse.json(
    { error: 'Paramètre "type" invalide. Valeurs acceptées : participants, resultats, rencontres' },
    { status: 400 }
  );
}
