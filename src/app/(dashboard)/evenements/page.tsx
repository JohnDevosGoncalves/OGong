"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";

interface EvenementRow {
  id: string;
  titre: string;
  format: string;
  date: string;
  status: string;
  _count: { participants: number };
}

const formatLabels: Record<string, { label: string; color: string }> = {
  speed_meeting: { label: "Speed meeting", color: "bg-primary/10 text-primary" },
  team: { label: "Team", color: "bg-accent/10 text-accent" },
  job_dating: { label: "Job dating", color: "bg-success/10 text-success" },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  brouillon: { label: "Brouillon", color: "bg-muted/10 text-muted" },
  ouvert: { label: "Ouvert", color: "bg-success/10 text-success" },
  en_cours: { label: "En cours", color: "bg-warning/10 text-warning" },
  termine: { label: "Terminé", color: "bg-muted/10 text-muted" },
};

export default function EvenementsPage() {
  const [evenements, setEvenements] = useState<EvenementRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/evenements")
      .then((res) => res.json())
      .then((data) => {
        setEvenements(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <OnboardingChecklist />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Événements</h1>
          <p className="text-muted text-sm mt-1">
            Gérez et suivez tous vos événements de networking.
          </p>
        </div>
        <Link
          href="/evenements/creer"
          className="flex items-center gap-2 py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Créer un événement
        </Link>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted text-sm">Chargement…</div>
        ) : evenements.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted text-sm mb-4">Aucun événement pour le moment.</p>
            <Link
              href="/evenements/creer"
              className="inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors"
            >
              Créer votre premier événement
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  Événement
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  Format
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  Participants
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  Statut
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {evenements.map((evt) => {
                const format = formatLabels[evt.format] || { label: evt.format, color: "" };
                const status = statusLabels[evt.status] || { label: evt.status, color: "" };
                return (
                  <tr key={evt.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/evenements/${evt.id}`}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {evt.titre}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${format.color}`}>
                        {format.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(evt.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {evt._count.participants}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/evenements/${evt.id}`}
                        className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
