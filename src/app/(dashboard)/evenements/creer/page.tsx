import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Créer un événement",
};

const formats = [
  {
    id: "speed_meeting",
    label: "Speed meeting",
    description: "Rencontres 1 à 1, tours minutés",
    icon: "1to1",
    color: "border-primary/30 bg-primary/5",
    activeColor: "border-primary bg-primary/10",
  },
  {
    id: "team",
    label: "Team",
    description: "Sessions en équipe, tailles XS à XL",
    icon: "team",
    color: "border-accent/30 bg-accent/5",
    activeColor: "border-accent bg-accent/10",
  },
  {
    id: "job_dating",
    label: "Job dating",
    description: "Rencontres avec exposants et créneaux",
    icon: "expo",
    color: "border-success/30 bg-success/5",
    activeColor: "border-success bg-success/10",
  },
];

export default function CreerEvenementPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/evenements"
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Créer un évènement
          </h1>
          <p className="text-muted text-sm mt-1">
            Configurez votre événement de networking.
          </p>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations générales */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">
            Informations générales
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-foreground mb-1.5">
                Titre
              </label>
              <input
                id="titre"
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="Ex: Demo Day 2024"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                placeholder="Décrivez votre événement..."
              />
            </div>

            <div>
              <label htmlFor="message-fin" className="block text-sm font-medium text-foreground mb-1.5">
                Message de fin
              </label>
              <input
                id="message-fin"
                type="text"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="Merci pour votre participation !"
              />
            </div>

            <div>
              <label htmlFor="societe" className="block text-sm font-medium text-foreground mb-1.5">
                Société
              </label>
              <select
                id="societe"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              >
                <option value="">Sélectionner une société</option>
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1.5">
                Date
              </label>
              <input
                id="date"
                type="date"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Durées de l'événement */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">
            Durées de l&apos;événement
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="heure-debut" className="block text-sm font-medium text-foreground mb-1.5">
                  Heure de début
                </label>
                <input
                  id="heure-debut"
                  type="time"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="heure-fin" className="block text-sm font-medium text-foreground mb-1.5">
                  Heure de fin
                </label>
                <input
                  id="heure-fin"
                  type="time"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="temps-parole" className="block text-sm font-medium text-foreground mb-1.5">
                  Temps de parole / tour
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="temps-parole"
                    type="number"
                    min={0}
                    placeholder="MM"
                    className="w-16 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <span className="text-muted">:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    placeholder="SS"
                    className="w-16 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="temps-pause" className="block text-sm font-medium text-foreground mb-1.5">
                  Temps de pause / tour
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="temps-pause"
                    type="number"
                    min={0}
                    placeholder="MM"
                    className="w-16 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <span className="text-muted">:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    placeholder="SS"
                    className="w-16 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted">
              Temps minimum recommandé : 1 min 10 s pour la parole, 30 s pour la pause.
            </p>

            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-3">
                Pause optionnelle
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="debut-pause" className="block text-xs text-muted mb-1">
                    Début pause
                  </label>
                  <input
                    id="debut-pause"
                    type="time"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="fin-pause" className="block text-xs text-muted mb-1">
                    Fin pause
                  </label>
                  <input
                    id="fin-pause"
                    type="time"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Animateurs de l&apos;événement
              </h3>
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Ajouter un animateur
              </button>
            </div>
          </div>
        </div>

        {/* Sélection du format */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Sélection du format
          </h2>
          <p className="text-muted text-sm mb-5">
            Cliquez sur une carte pour sélectionner un format parmi ceux disponibles dans votre abonnement.
          </p>

          <div className="space-y-3">
            {formats.map((format) => (
              <button
                key={format.id}
                type="button"
                className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm ${format.color}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface text-sm font-bold text-primary">
                    {format.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {format.label}
                    </p>
                    <p className="text-xs text-muted">{format.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors"
            >
              Créer l&apos;événement
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
