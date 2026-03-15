"use client";

import { useEffect, useState, useCallback } from "react";

interface TourTable {
  tableId: string;
  numero: number;
  participants: { id: string; nom: string; prenom: string; numero: number | null }[];
}

interface TourStatsData {
  id: string;
  numero: number;
  status: string;
  tables: TourTable[];
}

interface ToursResponse {
  tours: TourStatsData[];
  totalParticipants: number;
  totalTables: number;
}

interface AlgoStatsProps {
  eventId: string;
  hasTours: boolean;
}

export default function AlgoStats({ eventId, hasTours }: AlgoStatsProps) {
  const [toursStats, setToursStats] = useState<ToursResponse | null>(null);

  const fetchToursStats = useCallback(() => {
    fetch(`/api/evenements/${eventId}/tours`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: ToursResponse) => {
        setToursStats(data);
      })
      .catch(() => {
        setToursStats(null);
      });
  }, [eventId]);

  useEffect(() => {
    if (hasTours) {
      fetchToursStats();
    }
  }, [hasTours, fetchToursStats]);

  if (!toursStats || toursStats.tours.length === 0) return null;

  const statsNbTours = toursStats.tours.length;
  const statsTotalTables = toursStats.totalTables;
  const statsTotalParticipants = toursStats.totalParticipants;
  const maxPossibleMeetings = statsTotalParticipants > 1
    ? (statsTotalParticipants * (statsTotalParticipants - 1)) / 2
    : 0;

  const uniquePairsSet = new Set<string>();
  for (const tour of toursStats.tours) {
    for (const table of tour.tables) {
      const pIds = table.participants.map((p) => p.id).sort();
      for (let i = 0; i < pIds.length; i++) {
        for (let j = i + 1; j < pIds.length; j++) {
          uniquePairsSet.add(`${pIds[i]}-${pIds[j]}`);
        }
      }
    }
  }
  const uniqueMeetings = uniquePairsSet.size;
  const coverageRate = maxPossibleMeetings > 0
    ? Math.round((uniqueMeetings / maxPossibleMeetings) * 100)
    : 0;

  return (
    <div className="bg-surface rounded-xl border border-border p-6 mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">Statistiques de l&apos;algorithme</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-background border border-border">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Tours</p>
          <p className="text-2xl font-bold text-foreground">{statsNbTours}</p>
        </div>
        <div className="p-4 rounded-lg bg-background border border-border">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Tables</p>
          <p className="text-2xl font-bold text-foreground">{statsTotalTables}</p>
        </div>
        <div className="p-4 rounded-lg bg-background border border-border">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Rencontres uniques</p>
          <p className="text-2xl font-bold text-foreground">{uniqueMeetings}</p>
          <p className="text-xs text-muted mt-0.5">sur {maxPossibleMeetings} possibles</p>
        </div>
        <div className="p-4 rounded-lg bg-background border border-border">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Couverture</p>
          <p className="text-2xl font-bold text-foreground">{coverageRate}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${coverageRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
