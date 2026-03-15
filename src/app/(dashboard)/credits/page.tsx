import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crédits",
};

const packs = [
  {
    nom: "Speed Meeting",
    description: "Événements 1 à 1 minutés",
    prix: "29€",
    credits: 5,
    color: "border-primary/20 hover:border-primary/40",
    badge: "bg-primary/10 text-primary",
  },
  {
    nom: "Team",
    description: "Sessions en équipe XS à XL",
    prix: "49€",
    credits: 5,
    color: "border-accent/20 hover:border-accent/40",
    badge: "bg-accent/10 text-accent",
  },
  {
    nom: "Job Dating",
    description: "Événements avec exposants et créneaux",
    prix: "79€",
    credits: 5,
    color: "border-success/20 hover:border-success/40",
    badge: "bg-success/10 text-success",
  },
];

export default function CreditsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Crédits</h1>
      <p className="text-muted text-sm mb-8">
        Gérez vos crédits et achetez des packs pour créer de nouveaux événements.
      </p>

      {/* Crédits actuels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface rounded-xl border border-border p-6 flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary text-xl font-bold">
            4
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Speed Meeting</p>
            <p className="text-xs text-muted">crédits disponibles</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-6 flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent text-xl font-bold">
            2
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Team</p>
            <p className="text-xs text-muted">crédits disponibles</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-6 flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-success/10 text-success text-xl font-bold">
            1
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Job Dating</p>
            <p className="text-xs text-muted">crédit disponible</p>
          </div>
        </div>
      </div>

      {/* Acheter des packs */}
      <h2 className="text-lg font-semibold text-foreground mb-5">
        Acheter des crédits
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div
            key={pack.nom}
            className={`bg-surface rounded-xl border-2 p-6 transition-colors ${pack.color}`}
          >
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pack.badge}`}>
              {pack.nom}
            </span>
            <p className="text-muted text-sm mt-3 mb-4">{pack.description}</p>
            <p className="text-3xl font-bold text-foreground mb-1">
              {pack.prix}
            </p>
            <p className="text-xs text-muted mb-6">
              pour {pack.credits} crédits
            </p>
            <button className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors">
              Acheter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
