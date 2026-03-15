"use client";

import Link from "next/link";

interface TourInfo {
  id: string;
  numero: number;
  status: string;
  tables: {
    tableId: string;
    numero: number;
    participants: { id: string; nom: string; prenom: string; numero: number | null }[];
  }[];
}

interface TourSummaryProps {
  eventId: string;
  eventTitle: string;
  totalParticipants: number;
  tours: TourInfo[];
}

function calculateUniqueMeetings(tours: TourInfo[]): number {
  const meetingSet = new Set<string>();
  for (const tour of tours) {
    for (const table of tour.tables) {
      const participantIds = table.participants.map((p) => p.id).sort();
      for (let i = 0; i < participantIds.length; i++) {
        for (let j = i + 1; j < participantIds.length; j++) {
          meetingSet.add(`${participantIds[i]}-${participantIds[j]}`);
        }
      }
    }
  }
  return meetingSet.size;
}

export function TourSummary({
  eventId,
  eventTitle,
  totalParticipants,
  tours,
}: TourSummaryProps) {
  const uniqueMeetings = calculateUniqueMeetings(tours);
  const completedTours = tours.filter((t) => t.status === "termine").length;

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-background">
      <div className="bg-surface rounded-2xl border border-border p-8 md:p-12 max-w-lg w-full text-center">
        {/* Confetti-style icon */}
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          F&eacute;licitations !
        </h1>
        <p className="text-muted mb-8">
          L&apos;&eacute;v&eacute;nement &laquo;&nbsp;{eventTitle}&nbsp;&raquo; est termin&eacute;.
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-background rounded-xl p-4">
            <p className="text-2xl font-bold text-primary tabular-nums">
              {totalParticipants}
            </p>
            <p className="text-xs text-muted mt-1">Participants</p>
          </div>
          <div className="bg-background rounded-xl p-4">
            <p className="text-2xl font-bold text-success tabular-nums">
              {completedTours}
            </p>
            <p className="text-xs text-muted mt-1">Tours compl&eacute;t&eacute;s</p>
          </div>
          <div className="bg-background rounded-xl p-4">
            <p className="text-2xl font-bold text-accent tabular-nums">
              {uniqueMeetings}
            </p>
            <p className="text-xs text-muted mt-1">Rencontres uniques</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/evenements/${eventId}`}
            className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors text-center"
          >
            Retour &agrave; l&apos;&eacute;v&eacute;nement
          </Link>
          <a
            href={`/api/evenements/${eventId}/export?type=resultats`}
            className="py-3 px-6 rounded-xl border border-border text-foreground font-medium hover:bg-surface-hover transition-colors text-center inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exporter les r&eacute;sultats
          </a>
        </div>
      </div>
    </div>
  );
}
