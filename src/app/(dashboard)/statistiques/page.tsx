import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistiques",
};

export default function StatistiquesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Statistiques</h1>
      <p className="text-muted text-sm mb-8">
        Vue d&apos;ensemble de vos événements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Événements créés", value: "12", trend: "+3 ce mois" },
          { label: "Participants totaux", value: "348", trend: "+42 ce mois" },
          { label: "Taux de présence", value: "87%", trend: "+2%" },
          { label: "Tours réalisés", value: "156", trend: "" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border p-6">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            {stat.trend && (
              <p className="text-sm text-success mt-1">{stat.trend}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Historique des événements
        </h2>
        <p className="text-sm text-muted text-center py-12">
          Les graphiques et statistiques détaillées seront disponibles ici.
        </p>
      </div>
    </div>
  );
}
