import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Événements",
};

// Données de démo
const evenementsDemo = [
  {
    id: "1",
    titre: "Demo Day — Wild Code School",
    format: "speed_meeting" as const,
    date: "2024-03-20",
    status: "termine" as const,
    participants: 42,
  },
  {
    id: "2",
    titre: "Job Dating Printemps 2024",
    format: "job_dating" as const,
    date: "2024-04-15",
    status: "ouvert" as const,
    participants: 28,
  },
  {
    id: "3",
    titre: "Team Building Q2",
    format: "team" as const,
    date: "2024-05-10",
    status: "brouillon" as const,
    participants: 0,
  },
];

const formatLabels = {
  speed_meeting: { label: "Speed meeting", color: "bg-primary/10 text-primary" },
  team: { label: "Team", color: "bg-accent/10 text-accent" },
  job_dating: { label: "Job dating", color: "bg-success/10 text-success" },
};

const statusLabels = {
  brouillon: { label: "Brouillon", color: "bg-muted/10 text-muted" },
  ouvert: { label: "Ouvert", color: "bg-success/10 text-success" },
  en_cours: { label: "En cours", color: "bg-warning/10 text-warning" },
  termine: { label: "Terminé", color: "bg-muted/10 text-muted" },
};

export default function EvenementsPage() {
  return (
    <div>
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

      {/* Liste */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
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
            {evenementsDemo.map((evt) => {
              const format = formatLabels[evt.format];
              const status = statusLabels[evt.status];
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
                    {evt.participants}
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
      </div>
    </div>
  );
}
