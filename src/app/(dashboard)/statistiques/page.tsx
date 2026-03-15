"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StatsData {
  totalEvenements: number;
  evenementsTermines: number;
  evenementsEnCours: number;
  totalParticipants: number;
  totalTours: number;
  totalRencontres: number;
  parFormat: {
    speed_meeting: number;
    team: number;
    job_dating: number;
  };
  historique: {
    id: string;
    titre: string;
    format: string;
    date: string;
    status: string;
    nbParticipants: number;
    nbTours: number;
  }[];
}

const formatLabels: Record<string, string> = {
  speed_meeting: "Speed meeting",
  team: "Team",
  job_dating: "Job dating",
};

const statusLabels: Record<string, { label: string; class: string }> = {
  brouillon: { label: "Brouillon", class: "bg-muted/20 text-muted" },
  ouvert: { label: "Ouvert", class: "bg-primary/10 text-primary" },
  en_cours: { label: "En cours", class: "bg-warning/10 text-warning" },
  termine: { label: "Terminé", class: "bg-success/10 text-success" },
};

export default function StatistiquesPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/statistiques")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-muted py-20">Chargement…</div>;
  }

  if (!stats) {
    return <div className="text-center text-muted py-20">Impossible de charger les statistiques.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Statistiques</h1>
      <p className="text-muted text-sm mb-8">
        Vue d&apos;ensemble de vos événements.
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Événements créés</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalEvenements}</p>
          {stats.evenementsEnCours > 0 && (
            <p className="text-sm text-warning mt-1">{stats.evenementsEnCours} en cours</p>
          )}
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Participants totaux</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalParticipants}</p>
          {stats.totalEvenements > 0 && (
            <p className="text-sm text-muted mt-1">
              ~{Math.round(stats.totalParticipants / stats.totalEvenements)} / événement
            </p>
          )}
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Tours réalisés</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalTours}</p>
          <p className="text-sm text-muted mt-1">
            {stats.evenementsTermines} événement{stats.evenementsTermines > 1 ? "s" : ""} terminé{stats.evenementsTermines > 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Rencontres générées</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalRencontres}</p>
          <p className="text-sm text-success mt-1">paires uniques</p>
        </div>
      </div>

      {/* Répartition par format */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-xl border border-border p-5 flex items-center gap-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-lg font-bold">
            {stats.parFormat.speed_meeting}
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Speed Meeting</p>
            <p className="text-xs text-muted">événements</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 flex items-center gap-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent text-lg font-bold">
            {stats.parFormat.team}
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Team</p>
            <p className="text-xs text-muted">événements</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 flex items-center gap-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10 text-success text-lg font-bold">
            {stats.parFormat.job_dating}
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Job Dating</p>
            <p className="text-xs text-muted">événements</p>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Historique des événements</h2>

        {stats.historique.length === 0 ? (
          <p className="text-sm text-muted text-center py-12">
            Aucun événement créé pour le moment.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Événement</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Format</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Date</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Participants</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Tours</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.historique.map((evt) => {
                const st = statusLabels[evt.status] || { label: evt.status, class: "" };
                return (
                  <tr key={evt.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/evenements/${evt.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {evt.titre}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted">{formatLabels[evt.format] || evt.format}</td>
                    <td className="px-4 py-2.5 text-sm text-muted">
                      {new Date(evt.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-foreground">{evt.nbParticipants}</td>
                    <td className="px-4 py-2.5 text-sm text-foreground">{evt.nbTours}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.class}`}>{st.label}</span>
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
