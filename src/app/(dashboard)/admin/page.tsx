"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui";

interface PlatformStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalEvents: number;
  eventsByStatus: Record<string, number>;
  eventsByFormat: Record<string, number>;
  totalRevenue: number;
  creditsEnCirculation: number;
  activeUsers: number;
  usersByMonth: Record<string, number>;
  revenueByMonth: Record<string, number>;
}

const FORMAT_COLORS: Record<string, string> = {
  speed_meeting: "bg-primary",
  team: "bg-accent",
  job_dating: "bg-success",
};

const FORMAT_LABELS: Record<string, string> = {
  speed_meeting: "Speed Meeting",
  team: "Team",
  job_dating: "Job Dating",
};

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan",
  "02": "Fév",
  "03": "Mar",
  "04": "Avr",
  "05": "Mai",
  "06": "Jun",
  "07": "Jul",
  "08": "Aoû",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Déc",
};

function formatMonth(key: string): string {
  const [, month] = key.split("-");
  return MONTH_LABELS[month] || month;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (res.status === 403) {
          setError("Accès réservé au super administrateur");
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Impossible de charger les statistiques");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-muted py-20">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-danger font-medium">{error}</p>
        <Link href="/evenements" className="text-primary text-sm mt-2 inline-block hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  if (!stats) return null;

  const totalFormatEvents = Object.values(stats.eventsByFormat).reduce((a, b) => a + b, 0);
  const maxUsersPerMonth = Math.max(...Object.values(stats.usersByMonth), 1);
  const maxRevenuePerMonth = Math.max(...Object.values(stats.revenueByMonth), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administration</h1>
          <p className="text-muted text-sm mt-1">
            Vue d&apos;ensemble de la plateforme OGong
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total utilisateurs"
          value={stats.totalUsers}
          detail={`+${stats.newUsersThisMonth} ce mois`}
          detailColor="text-success"
        />
        <StatCard
          label="Événements actifs"
          value={(stats.eventsByStatus["ouvert"] || 0) + (stats.eventsByStatus["en_cours"] || 0)}
          detail={`${stats.totalEvents} au total`}
        />
        <StatCard
          label="Revenus total"
          value={`${stats.totalRevenue.toFixed(2)} €`}
          detail={`${stats.activeUsers} utilisateurs actifs`}
        />
        <StatCard
          label="Crédits en circulation"
          value={stats.creditsEnCirculation}
          detail="achetés + bonus - utilisés"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* New users per month */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Nouveaux utilisateurs par mois</h3>
          <div className="flex items-end gap-2 h-40">
            {Object.entries(stats.usersByMonth).map(([key, count]) => (
              <div key={key} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted font-medium">{count}</span>
                <div
                  className="w-full bg-primary rounded-t-md transition-all"
                  style={{ height: `${Math.max((count / maxUsersPerMonth) * 100, 4)}%` }}
                />
                <span className="text-xs text-muted">{formatMonth(key)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events by format */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Événements par format</h3>
          <div className="space-y-4">
            {Object.entries(stats.eventsByFormat).map(([format, count]) => {
              const pct = totalFormatEvents > 0 ? (count / totalFormatEvents) * 100 : 0;
              return (
                <div key={format}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{FORMAT_LABELS[format] || format}</span>
                    <span className="text-muted">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-3 bg-border/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${FORMAT_COLORS[format] || "bg-primary"}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.eventsByFormat).length === 0 && (
              <p className="text-sm text-muted text-center py-4">Aucun événement</p>
            )}
          </div>
        </div>

        {/* Revenue trend */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenus (6 derniers mois)</h3>
          <div className="flex items-end gap-2 h-40">
            {Object.entries(stats.revenueByMonth).map(([key, amount]) => (
              <div key={key} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted font-medium">{amount > 0 ? `${amount.toFixed(0)}€` : "0"}</span>
                <div
                  className="w-full bg-success rounded-t-md transition-all"
                  style={{ height: `${Math.max((amount / maxRevenuePerMonth) * 100, 4)}%` }}
                />
                <span className="text-xs text-muted">{formatMonth(key)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/utilisateurs"
          className="bg-surface rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-foreground font-semibold group-hover:text-primary transition-colors">Gérer les utilisateurs</p>
              <p className="text-sm text-muted">Rôles, crédits et suppression</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/evenements"
          className="bg-surface rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <div>
              <p className="text-foreground font-semibold group-hover:text-primary transition-colors">Voir tous les événements</p>
              <p className="text-sm text-muted">Modération et supervision</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
