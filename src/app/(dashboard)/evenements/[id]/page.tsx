import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Détail de l'événement",
};

export default function EvenementDetailPage() {
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Demo Day — Wild Code School
          </h1>
          <p className="text-muted text-sm mt-1">
            Speed meeting · 20 mars 2024
          </p>
        </div>
        <div className="flex gap-3">
          <button className="py-2.5 px-5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors">
            Modifier
          </button>
          <button className="py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors">
            Lancer l&apos;événement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Participants</p>
          <p className="text-3xl font-bold text-foreground">42</p>
          <p className="text-sm text-success mt-1">38 présents</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Tables</p>
          <p className="text-3xl font-bold text-foreground">7</p>
          <p className="text-sm text-muted mt-1">6 participants / table</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Tours</p>
          <p className="text-3xl font-bold text-foreground">4</p>
          <p className="text-sm text-muted mt-1">4 min / tour</p>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Participants
          </h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 py-2 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Import CSV
            </button>
            <button className="flex items-center gap-2 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>

        <p className="text-sm text-muted text-center py-12">
          Les participants apparaîtront ici une fois ajoutés.
        </p>
      </div>
    </div>
  );
}
