"use client";

import { useEffect, useState } from "react";
import { StatCard, Card } from "@/components/ui";

interface RevenueStats {
  totalRevenue: number;
  totalPayments: number;
  totalUsers: number;
  creditsAchetes: number;
  creditsUtilises: number;
  creditsBonus: number;
  creditsEnCirculation: number;
  revenueByMonth: Record<string, number>;
}

interface Payment {
  id: string;
  montantEuros: number;
  credits: number;
  status: string;
  createdAt: string;
  user: {
    nom: string;
    prenom: string;
    email: string;
  };
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Janvier",
  "02": "Février",
  "03": "Mars",
  "04": "Avril",
  "05": "Mai",
  "06": "Juin",
  "07": "Juillet",
  "08": "Août",
  "09": "Septembre",
  "10": "Octobre",
  "11": "Novembre",
  "12": "Décembre",
};

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  complete: { label: "Complété", class: "bg-success/15 text-success" },
  en_attente: { label: "En attente", class: "bg-warning/15 text-warning" },
  echoue: { label: "Échoué", class: "bg-danger/15 text-danger" },
};

function formatMonth(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTH_LABELS[month] || month} ${year}`;
}

export default function AdminRevenusPage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((res) => {
        if (res.status === 403) throw new Error("forbidden");
        return res.json();
      }),
      fetch("/api/admin/revenus/payments").then((res) => {
        if (res.ok) return res.json();
        return { payments: [] };
      }).catch(() => ({ payments: [] })),
    ])
      .then(([statsData, paymentsData]) => {
        setStats(statsData);
        setPayments(paymentsData.payments || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message === "forbidden") {
          setError("Accès réservé au super administrateur");
        } else {
          setError("Impossible de charger les données");
        }
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
      </div>
    );
  }

  if (!stats) return null;

  const avgPerUser = stats.totalUsers > 0 ? stats.totalRevenue / stats.totalUsers : 0;
  const maxRevenue = Math.max(...Object.values(stats.revenueByMonth), 1);
  const totalCredits = stats.creditsAchetes + stats.creditsBonus;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Revenus</h1>
        <p className="text-muted text-sm mt-1">
          Suivi financier et crédits de la plateforme
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Revenus total"
          value={`${stats.totalRevenue.toFixed(2)} €`}
          detail={`${stats.totalPayments} paiement(s)`}
          detailColor="text-success"
        />
        <StatCard
          label="Revenu moyen / utilisateur"
          value={`${avgPerUser.toFixed(2)} €`}
          detail={`${stats.totalUsers} utilisateurs`}
        />
        <StatCard
          label="Crédits distribués"
          value={totalCredits}
          detail={`${stats.creditsAchetes} achetés + ${stats.creditsBonus} bonus`}
        />
        <StatCard
          label="Crédits en circulation"
          value={stats.creditsEnCirculation}
          detail={`${stats.creditsUtilises} utilisés`}
          detailColor="text-warning"
        />
      </div>

      {/* Revenue trend chart */}
      <Card title="Évolution des revenus (6 derniers mois)" className="mb-8">
        <div className="space-y-3">
          {Object.entries(stats.revenueByMonth).map(([key, amount]) => {
            const pct = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
            return (
              <div key={key} className="flex items-center gap-4">
                <span className="text-sm text-muted w-36 shrink-0">{formatMonth(key)}</span>
                <div className="flex-1 h-6 bg-border/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${Math.max(pct, 1)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-20 text-right">{amount.toFixed(2)} €</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Credit usage breakdown */}
      <Card title="Répartition des crédits" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-3xl font-bold text-primary">{stats.creditsAchetes}</p>
            <p className="text-sm text-muted mt-1">Crédits achetés</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/10">
            <p className="text-3xl font-bold text-accent">{stats.creditsBonus}</p>
            <p className="text-sm text-muted mt-1">Crédits bonus</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/10">
            <p className="text-3xl font-bold text-warning">{stats.creditsUtilises}</p>
            <p className="text-sm text-muted mt-1">Crédits utilisés</p>
          </div>
        </div>

        {/* Progress bar */}
        {totalCredits > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-xs text-muted mb-2">
              <span>Utilisés ({((stats.creditsUtilises / totalCredits) * 100).toFixed(0)}%)</span>
              <span>Restants ({((stats.creditsEnCirculation / totalCredits) * 100).toFixed(0)}%)</span>
            </div>
            <div className="h-4 bg-border/30 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-warning transition-all"
                style={{ width: `${(stats.creditsUtilises / totalCredits) * 100}%` }}
              />
              <div
                className="h-full bg-success transition-all"
                style={{ width: `${(stats.creditsEnCirculation / totalCredits) * 100}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Payment history */}
      <Card title="Historique des paiements">
        {payments.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">
            Aucun paiement enregistré pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Date</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Utilisateur</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Montant</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Crédits</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => {
                  const st = STATUS_LABELS[p.status] || { label: p.status, class: "bg-muted/15 text-muted" };
                  return (
                    <tr key={p.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-2.5 text-sm text-muted">
                        {new Date(p.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-sm text-foreground">{p.user.prenom} {p.user.nom}</span>
                        <span className="text-xs text-muted block">{p.user.email}</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-foreground">
                        {p.montantEuros.toFixed(2)} €
                      </td>
                      <td className="px-4 py-2.5 text-sm text-foreground">
                        {p.credits}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.class}`}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
